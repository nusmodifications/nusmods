import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { downloadCurrentPdfs, MAX_PDF_BYTES } from './download';
import type {
  CourseRegClassHistory,
  CourseRegModuleSemesterHistory,
  CourseRegRound,
  CourseRegRoundHistory,
  CourseRegSlotValue,
  CourseRegStudentType,
  ModuleCode,
  Semester,
} from './types';

const COURSE_REG_ROUNDS_BEFORE_AY_2425: Array<CourseRegRound> = [0, 1, 2, 3];
const COURSE_REG_ROUNDS_AFTER_AY_2425: Array<CourseRegRound> = [1, 2, 3];
const STUDENT_TYPES: Array<CourseRegStudentType> = ['UG', 'GD'];

type CsvRow = Array<string>;

type DemandAllocationRow = {
  allocatedSlots: CourseRegSlotValue;
  classNo: string;
  moduleCode: ModuleCode;
  registered: number | null;
};

type VacancyRow = {
  classNo: string;
  forecastedSlots: Record<CourseRegStudentType, CourseRegSlotValue>;
  moduleCode: ModuleCode;
};

type MergedClassRound = {
  classNo: string;
  moduleCode: ModuleCode;
  roundHistory: CourseRegRoundHistory;
  studentType: CourseRegStudentType;
};

type CourseClassKey = `${ModuleCode}:${string}`;

const REPORT_TYPES = ['vacancy', ...STUDENT_TYPES] as const;

export function getCourseRegRounds(academicYear: string): Array<CourseRegRound> {
  const yearStart = Number(academicYear.replace('/', '').replace('-', '').slice(0, 4));
  return yearStart <= 2023 ? COURSE_REG_ROUNDS_BEFORE_AY_2425 : COURSE_REG_ROUNDS_AFTER_AY_2425;
}

export function parseCsv(text: string): Array<CsvRow> {
  const rows: Array<CsvRow> = [];
  let cell = '';
  let row: CsvRow = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i += 1;
      }
      row.push(cell);
      rows.push(row);
      cell = '';
      row = [];
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

const cleanCell = (cell: string) => cell.split(/\s+/).join(' ').trim();

const cleanRow = (row: CsvRow) => row.map(cleanCell);

const isBlankTailRow = (row: CsvRow, tailLength: number) =>
  row.length >= tailLength && row.slice(-tailLength).every((cell) => cleanCell(cell) === '');

const mergeOverflowRows = (rows: Array<CsvRow>, tailLength: number): Array<CsvRow> => {
  const mergedRows: Array<CsvRow> = [];

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const nextRow = rows[i + 1];

    if (nextRow && isBlankTailRow(nextRow, tailLength)) {
      mergedRows.push(row.map((cell, index) => cleanCell(`${cell} ${nextRow[index] ?? ''}`)));
      i += 1;
    } else {
      mergedRows.push(row);
    }
  }

  return mergedRows;
};

const normalizedRowText = (row: CsvRow) =>
  row.map((cell) => cleanCell(cell).toLowerCase()).join('|');

const isDemandHeaderRow = (row: CsvRow) => {
  const cells = row.map((cell) => cleanCell(cell).toLowerCase());
  const text = normalizedRowText(row);
  return (
    ['code', 'course code', 'module code'].includes(cells[2]) ||
    ['class', 'course class', 'module class'].includes(cells[4]) ||
    text.includes('successful allocations') ||
    text.includes('quota exceeded')
  );
};

const isVacancyHeaderRow = (row: CsvRow) => {
  const cells = row.map((cell) => cleanCell(cell).toLowerCase());
  const text = normalizedRowText(row);
  return (
    ['code', 'course code', 'module code'].includes(cells[2]) ||
    ['class', 'course class', 'module class'].includes(cells[4]) ||
    text.includes('faculty/school') ||
    text === '|||||ug|gd|dk|ng|cpe'
  );
};

const getCourseClassKey = (moduleCode: ModuleCode, classNo: string): CourseClassKey =>
  `${moduleCode}:${classNo}`;

const parseCount = (rawValue: string | undefined): number | null => {
  const value = cleanCell(rawValue ?? '');
  if (!value || value === '-' || value.toLowerCase() === 'x') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseSlotValue = (rawValue: string | undefined): CourseRegSlotValue => {
  const value = cleanCell(rawValue ?? '').toLowerCase();

  if (!value || value === 'x' || value === 'na' || value === '-1') {
    return 'notAvailable';
  }
  if (value === '-') {
    return 'unlimited';
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 'notAvailable';
  }
  if (parsed >= 2_147_483_647) {
    return 'unlimited';
  }
  return parsed;
};

const parseDemandSlotValue = (
  rawSlotValue: string | undefined,
  rawDemandValue: string | undefined,
): CourseRegSlotValue => {
  const slotValue = cleanCell(rawSlotValue ?? '');
  if (slotValue) {
    return parseSlotValue(slotValue);
  }

  const demand = parseCount(rawDemandValue);
  return demand && demand > 0 ? 'unlimited' : 'notAvailable';
};

const normalizeClassNo = (rawValue: string | undefined) => {
  const classNo = cleanCell(rawValue ?? '');
  const parts = classNo.split(' - ');
  return parts.length >= 2 ? parts[1] : classNo;
};

export function parseDemandAllocationCsv(text: string): Array<DemandAllocationRow> {
  const cleanedRows = mergeOverflowRows(
    parseCsv(text)
      .map(cleanRow)
      .filter((row) => row.some(Boolean))
      .filter((row) => !isDemandHeaderRow(row)),
    8,
  );

  return cleanedRows
    .filter((row) => row.length >= 7)
    .map((row) => ({
      allocatedSlots: parseDemandSlotValue(row[5], row[6]),
      classNo: normalizeClassNo(row[4]),
      moduleCode: cleanCell(row[2]).toUpperCase(),
      registered: parseCount(row[6]),
    }))
    .filter((row) => row.moduleCode && row.classNo);
}

export function parseVacancyCsv(text: string): Array<VacancyRow> {
  const rows = mergeOverflowRows(
    parseCsv(text)
      .map(cleanRow)
      .filter((row) => row.some(Boolean))
      .filter((row) => !isVacancyHeaderRow(row)),
    5,
  );
  const seenRows = new Set<string>();
  const vacancyRows: Array<VacancyRow> = [];

  for (const row of rows) {
    if (row.length < 7) {
      continue;
    }

    const moduleCode = cleanCell(row[2]).toUpperCase();
    const classNo = normalizeClassNo(row[4]);
    const key = getCourseClassKey(moduleCode, classNo);

    if (!moduleCode || !classNo || seenRows.has(key)) {
      continue;
    }

    seenRows.add(key);
    vacancyRows.push({
      classNo,
      forecastedSlots: {
        GD: parseSlotValue(row[6]),
        UG: parseSlotValue(row[5]),
      },
      moduleCode,
    });
  }

  return vacancyRows;
}

const mapByClass = <T extends { classNo: string; moduleCode: ModuleCode }>(rows: Array<T>) =>
  new Map(rows.map((row) => [getCourseClassKey(row.moduleCode, row.classNo), row]));

export function mergeCourseRegRound(
  round: CourseRegRound,
  studentType: CourseRegStudentType,
  demandRows: Array<DemandAllocationRow>,
  vacancyRows: Array<VacancyRow>,
): Array<MergedClassRound> {
  const demandByClass = mapByClass(demandRows);
  const vacancyByClass = mapByClass(
    vacancyRows.filter((row) => row.forecastedSlots[studentType] !== 'notAvailable'),
  );
  const keys = Array.from(new Set([...demandByClass.keys(), ...vacancyByClass.keys()])).sort();

  return keys.map((key) => {
    const demandRow = demandByClass.get(key);
    const vacancyRow = vacancyByClass.get(key);
    const [moduleCode, classNo] = key.split(':');
    const forecastedSlots = vacancyRow?.forecastedSlots[studentType] ?? 'notAvailable';

    return {
      classNo,
      moduleCode,
      roundHistory: {
        allocatedSlots: demandRow?.allocatedSlots ?? forecastedSlots,
        forecastedSlots,
        registered: demandRow?.registered ?? (forecastedSlots === 'notAvailable' ? null : 0),
        round,
      },
      studentType,
    };
  });
}

export function groupCourseRegHistory(
  academicYear: string,
  semester: Semester,
  mergedRows: Array<MergedClassRound>,
): Array<CourseRegModuleSemesterHistory> {
  const modules = new Map<ModuleCode, Map<string, CourseRegClassHistory>>();

  for (const row of mergedRows) {
    if (!modules.has(row.moduleCode)) {
      modules.set(row.moduleCode, new Map());
    }

    const classes = modules.get(row.moduleCode)!;
    const classKey = `${row.studentType}:${row.classNo}`;
    if (!classes.has(classKey)) {
      classes.set(classKey, {
        classNo: row.classNo,
        rounds: [],
        studentType: row.studentType,
      });
    }

    classes.get(classKey)!.rounds.push(row.roundHistory);
  }

  return Array.from(modules.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([moduleCode, classes]) => ({
      acadYear: academicYear,
      classes: Array.from(classes.values())
        .map((historyClass) => ({
          ...historyClass,
          rounds: historyClass.rounds.sort((left, right) => left.round - right.round),
        }))
        .sort(
          (left, right) =>
            left.studentType.localeCompare(right.studentType) ||
            left.classNo.localeCompare(right.classNo),
        ),
      moduleCode,
      semester,
    }));
}

const sortClasses = (classes: Array<CourseRegClassHistory>) =>
  classes
    .map((historyClass) => ({
      ...historyClass,
      rounds: historyClass.rounds.sort((left, right) => left.round - right.round),
    }))
    .sort(
      (left, right) =>
        left.studentType.localeCompare(right.studentType) ||
        left.classNo.localeCompare(right.classNo),
    );

const getHistoryClassKey = (historyClass: CourseRegClassHistory) =>
  `${historyClass.studentType}:${historyClass.classNo}`;

const notAvailableRound = (round: CourseRegRound): CourseRegRoundHistory => ({
  allocatedSlots: 'notAvailable',
  forecastedSlots: 'notAvailable',
  registered: null,
  round,
});

export function mergeCourseRegHistories(
  existingHistories: Array<CourseRegModuleSemesterHistory>,
  incomingHistories: Array<CourseRegModuleSemesterHistory>,
  replaceRounds: Record<CourseRegStudentType, ReadonlySet<CourseRegRound>>,
): Array<CourseRegModuleSemesterHistory> {
  const moduleMap = new Map<ModuleCode, CourseRegModuleSemesterHistory>();
  const incomingClassKeys = new Set<string>();

  for (const moduleHistory of existingHistories) {
    moduleMap.set(moduleHistory.moduleCode, {
      ...moduleHistory,
      classes: moduleHistory.classes.map((historyClass) => ({
        ...historyClass,
        rounds: historyClass.rounds.filter(
          ({ round }) => !replaceRounds[historyClass.studentType].has(round),
        ),
      })),
    });
  }

  for (const moduleHistory of incomingHistories) {
    const existingModule = moduleMap.get(moduleHistory.moduleCode);
    const classMap = new Map(
      (existingModule?.classes ?? []).map((historyClass) => [
        getHistoryClassKey(historyClass),
        historyClass,
      ]),
    );

    for (const historyClass of moduleHistory.classes) {
      const classKey = getHistoryClassKey(historyClass);
      incomingClassKeys.add(`${moduleHistory.moduleCode}:${classKey}`);
      classMap.set(classKey, {
        ...historyClass,
        rounds: [
          ...(classMap.get(classKey)?.rounds ?? []),
          ...historyClass.rounds.filter(({ round }) =>
            replaceRounds[historyClass.studentType].has(round),
          ),
        ],
      });
    }

    moduleMap.set(moduleHistory.moduleCode, {
      acadYear: moduleHistory.acadYear,
      classes: Array.from(classMap.values()),
      moduleCode: moduleHistory.moduleCode,
      semester: moduleHistory.semester,
    });
  }

  for (const [moduleCode, moduleHistory] of moduleMap) {
    moduleHistory.classes = moduleHistory.classes.map((historyClass) => {
      const classKey = getHistoryClassKey(historyClass);
      if (incomingClassKeys.has(`${moduleCode}:${classKey}`)) {
        return historyClass;
      }

      return {
        ...historyClass,
        rounds: [
          ...historyClass.rounds,
          ...Array.from(replaceRounds[historyClass.studentType], notAvailableRound),
        ],
      };
    });
  }

  return Array.from(moduleMap.values())
    .sort((left, right) => left.moduleCode.localeCompare(right.moduleCode))
    .map((moduleHistory) => ({
      ...moduleHistory,
      classes: sortClasses(moduleHistory.classes),
    }));
}

const resolveInputFile = (
  inputDir: string,
  round: CourseRegRound,
  reportType: 'vacancy' | CourseRegStudentType,
) => {
  if (reportType === 'vacancy') {
    return path.join(inputDir, 'vacancy', `round_${round}.csv`);
  }

  return path.join(inputDir, reportType.toLowerCase(), `round_${round}.csv`);
};

const resolvePdfFile = (
  pdfDir: string,
  round: CourseRegRound,
  reportType: 'vacancy' | CourseRegStudentType,
) => {
  if (reportType === 'vacancy') {
    return path.join(pdfDir, 'vacancy', `round_${round}.pdf`);
  }

  return path.join(pdfDir, reportType.toLowerCase(), `round_${round}.pdf`);
};

const outputFile = async (file: string, data: Buffer | string) => {
  await mkdir(path.dirname(file), { recursive: true });
  const temporaryFile = `${file}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporaryFile, data);
    await rename(temporaryFile, file);
  } finally {
    await rm(temporaryFile, { force: true });
  }
};

const outputJson = async (file: string, data: unknown) => {
  const spaces = process.env.NODE_ENV === 'production' ? 0 : 2;
  await outputFile(file, `${JSON.stringify(data, null, spaces)}\n`);
};

const readJsonIfExists = async <T>(file: string): Promise<T | undefined> => {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
};

const pathExists = async (file: string) => {
  try {
    await stat(file);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }
    throw error;
  }
};

const getPdfToCsvScriptPath = () =>
  path.resolve(process.cwd(), 'scripts', 'coursereg_pdf_to_csv.py');

const CONVERSION_TIMEOUT_MS = 120_000;

const convertPdfsToCsvs = (
  pdfDir: string,
  csvDir: string,
  python: string,
  period?: { academicYear: string; semester: Semester },
) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(
      python,
      [
        getPdfToCsvScriptPath(),
        '--pdf-dir',
        pdfDir,
        '--csv-dir',
        csvDir,
        '--max-pdf-bytes',
        String(MAX_PDF_BYTES),
        ...(period
          ? ['--academic-year', period.academicYear, '--semester', String(period.semester)]
          : []),
      ],
      {
        killSignal: 'SIGKILL',
        stdio: 'inherit',
        timeout: CONVERSION_TIMEOUT_MS,
      },
    );

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `CourseReg PDF conversion failed (${signal ?? `exit code ${code}`}, timeout ${CONVERSION_TIMEOUT_MS / 1000}s)`,
          ),
        );
      }
    });
  });

export class DemandAllocationScraper {
  private readonly academicYear: string;

  private readonly archiveDir: string;

  private readonly csvDir: string;

  private readonly outputDir: string;

  private readonly python: string;

  private readonly semester: Semester;

  constructor(semester: Semester, academicYear: string, outputDir?: string) {
    const yearDir = academicYear.replace('/', '-');
    const archiveRoot = process.env.COURSE_REG_ARCHIVE_DIR || 'archive/pdfs';
    this.academicYear = academicYear;
    this.semester = semester;
    this.archiveDir = path.resolve(archiveRoot, yearDir, 'semesters', String(semester));
    this.csvDir = path.resolve('data', yearDir, 'semesters', String(semester), 'csv');
    this.outputDir = outputDir ?? path.resolve('..', 'data', yearDir);
    const venvPython = path.resolve('.venv/bin/python');
    this.python = existsSync(venvPython) ? venvPython : 'python3';
  }

  async importArchive() {
    const csvDir = await mkdtemp(path.join(tmpdir(), 'nusmods-coursereg-'));
    try {
      console.info(
        JSON.stringify({ archiveDir: this.archiveDir, message: 'Importing CourseReg PDFs' }),
      );
      await convertPdfsToCsvs(this.archiveDir, csvDir, this.python);
      return await this.writeHistory(csvDir);
    } finally {
      await rm(csvDir, { force: true, recursive: true });
    }
  }

  async download() {
    if (this.semester !== 1 && this.semester !== 2) {
      throw new Error('CourseReg PDF downloads are supported for semesters 1 and 2');
    }

    const temporaryDir = await mkdtemp(path.join(tmpdir(), 'nusmods-coursereg-'));
    try {
      const pdfDir = path.join(temporaryDir, 'pdfs');
      const csvDir = path.join(temporaryDir, 'csv');
      const rounds = getCourseRegRounds(this.academicYear);
      const period = { academicYear: this.academicYear, semester: this.semester };
      console.info(JSON.stringify({ ...period, rounds, message: 'Downloading CourseReg PDFs' }));
      await downloadCurrentPdfs(temporaryDir, pdfDir, rounds);
      await convertPdfsToCsvs(pdfDir, csvDir, this.python, period);

      const completeRounds: Array<CourseRegRound> = [];
      for (const round of rounds) {
        const csvsExist = await Promise.all(
          REPORT_TYPES.map((reportType) => pathExists(resolveInputFile(csvDir, round, reportType))),
        );
        if (csvsExist.every(Boolean)) {
          completeRounds.push(round);
        } else {
          console.warn(JSON.stringify({ round, warning: 'Skipping incomplete CourseReg round' }));
        }
      }

      if (!completeRounds.length) {
        throw new Error(
          'No complete CourseReg rounds available for the configured academic period',
        );
      }

      for (const round of completeRounds) {
        for (const reportType of REPORT_TYPES) {
          const pdf = await readFile(resolvePdfFile(pdfDir, round, reportType));
          await outputFile(resolvePdfFile(this.archiveDir, round, reportType), pdf);
          const csv = await readFile(resolveInputFile(csvDir, round, reportType));
          await outputFile(resolveInputFile(this.csvDir, round, reportType), csv);
        }
      }

      return await this.writeHistory(csvDir, completeRounds);
    } finally {
      await rm(temporaryDir, { force: true, recursive: true });
    }
  }

  async writeHistory(inputDir: string, rounds = getCourseRegRounds(this.academicYear)) {
    const mergedRows: Array<MergedClassRound> = [];
    for (const round of rounds) {
      const vacancyFile = resolveInputFile(inputDir, round, 'vacancy');
      if (!(await pathExists(vacancyFile))) {
        console.warn(
          JSON.stringify({
            round,
            vacancyFile,
            warning: 'CourseReg vacancy CSV not found, skipping round',
          }),
        );
        continue;
      }

      const vacancyRows = parseVacancyCsv(await readFile(vacancyFile, 'utf8'));

      for (const studentType of STUDENT_TYPES) {
        const demandFile = resolveInputFile(inputDir, round, studentType);
        if (!(await pathExists(demandFile))) {
          console.warn(
            JSON.stringify({
              demandFile,
              round,
              studentType,
              warning: 'CourseReg demand CSV not found, skipping student type',
            }),
          );
          continue;
        }

        const demandRows = parseDemandAllocationCsv(await readFile(demandFile, 'utf8'));
        mergedRows.push(...mergeCourseRegRound(round, studentType, demandRows, vacancyRows));
      }
    }

    const extractedHistories = groupCourseRegHistory(this.academicYear, this.semester, mergedRows);
    if (!extractedHistories.length) {
      throw new Error(
        'No CourseReg history extracted. Check that the staged PDFs contain released CourseReg data.',
      );
    }

    const outputPath = path.join(
      this.outputDir,
      'semesters',
      String(this.semester),
      'courseRegHistory.json',
    );
    const existingHistories =
      await readJsonIfExists<Array<CourseRegModuleSemesterHistory>>(outputPath);
    const updatedRounds = { GD: new Set<CourseRegRound>(), UG: new Set<CourseRegRound>() };
    for (const { studentType, roundHistory } of mergedRows) {
      updatedRounds[studentType].add(roundHistory.round);
    }
    const histories = existingHistories
      ? mergeCourseRegHistories(existingHistories, extractedHistories, updatedRounds)
      : extractedHistories;

    await outputJson(outputPath, histories);

    console.info(
      JSON.stringify({
        modules: histories.length,
        outputPath,
        message: 'CourseReg history written',
      }),
    );
    return histories;
  }
}
