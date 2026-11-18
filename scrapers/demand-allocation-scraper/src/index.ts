import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { DemandAllocationScraper, normalizeAcademicYearForPath } from './scraper';
import type { CourseRegRound, Semester } from './types';

const usage = `Usage:
  pnpm dev [<semester> <academic-year>] [options]

With no semester or academic year, use the NUSMods website config and download
the available CourseReg PDFs.

Options:
  --archiveDir <dir>  Directory used to archive staged/downloaded PDFs
  --download          Download current PDFs with headless Chrome before conversion
  --inputDir <dir>    Directory for extracted CSVs
  --outputDir <dir>   API output academic-year directory
  --pdfDir <dir>      Directory containing staged PDFs
  --python <path>     Python executable for PDF conversion
  --round <0|1|2|3>   CourseReg round to process
  --help              Show this help
`;

const normalizeAcademicYear = (value: string) => {
  if (value.length === 2) {
    return `20${value}/20${Number(value) + 1}`;
  }
  if (value.length === 4) {
    return `${value}/${Number(value) + 1}`;
  }
  return value.replace('-', '/');
};

const parseSemester = (value: string): Semester => {
  const semester = Number(value);
  if (![1, 2, 3, 4].includes(semester)) {
    throw new Error(`Invalid semester: ${value}`);
  }
  return semester as Semester;
};

const parseRound = (value: string | undefined): CourseRegRound | undefined => {
  if (value === undefined) {
    return undefined;
  }

  const round = Number(value);
  if (![0, 1, 2, 3].includes(round)) {
    throw new Error(`Invalid CourseReg round: ${value}`);
  }
  return round as CourseRegRound;
};

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      archiveDir: { type: 'string' },
      download: { type: 'boolean' },
      help: { short: 'h', type: 'boolean' },
      inputDir: { type: 'string' },
      outputDir: { type: 'string' },
      pdfDir: { type: 'string' },
      python: { default: 'python3', type: 'string' },
      round: { type: 'string' },
    },
  });

  if (values.help) {
    console.log(usage);
    return;
  }

  if (positionals.length !== 0 && positionals.length !== 2) {
    throw new Error(`Provide both semester and academic year, or neither.\n\n${usage}`);
  }

  const current = positionals.length === 0;
  const [semesterValue, academicYearValue] = current ? await readCurrentPeriod() : positionals;
  const semester = parseSemester(semesterValue);
  const academicYear = normalizeAcademicYear(academicYearValue);
  const download = values.download ?? (current && !values.pdfDir);
  const scraper = new DemandAllocationScraper(semester, academicYear, {
    archiveDir: values.archiveDir,
    download,
    inputDir: values.inputDir,
    outputDir: values.outputDir,
    pdfDir: values.pdfDir,
    python: values.python,
    round: parseRound(values.round),
  });

  console.info(
    JSON.stringify({
      academicYear,
      academicYearPath: normalizeAcademicYearForPath(academicYear),
      semester,
      message: 'Running demand allocation scraper',
    }),
  );
  await scraper.run();
}

async function readCurrentPeriod(): Promise<[string, string]> {
  const configPath = path.resolve(__dirname, '../../../../website/src/config/app-config.json');
  const { academicYear, semester } = JSON.parse(await readFile(configPath, 'utf8'));
  return [String(semester), String(academicYear)];
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
