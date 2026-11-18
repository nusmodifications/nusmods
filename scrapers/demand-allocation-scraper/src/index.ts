import { parseArgs } from 'node:util';
import { scraperPeriod } from 'nusmods-academic-calendar';

import { DemandAllocationScraper, normalizeAcademicYearForPath } from './scraper';
import type { CourseRegRound, Semester } from './types';

const usage = `Usage:
  pnpm dev [<semester> <academic-year>] [options]

With no semester or academic year, use the shared scraper period and download
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
  if (/^(?:\d{2}|\d{4})$/.test(value)) {
    const start = value.length === 2 ? 2000 + Number(value) : Number(value);
    return `${start}/${start + 1}`;
  }
  const [start, end] = value.split(/[-/]/);
  if (!/^\d{4}[-/]\d{4}$/.test(value) || Number(end) !== Number(start) + 1) {
    throw new Error(`Invalid academic year: ${value}`);
  }
  return `${start}/${end}`;
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

  const { help, round, download, ...options } = values;
  if (help) {
    console.log(usage);
    return;
  }

  if (positionals.length !== 0 && positionals.length !== 2) {
    throw new Error(`Provide both semester and academic year, or neither.\n\n${usage}`);
  }

  const current = positionals.length === 0;
  const semester = current ? scraperPeriod.semester : parseSemester(positionals[0]);
  const academicYear = current ? scraperPeriod.academicYear : normalizeAcademicYear(positionals[1]);
  const scraper = new DemandAllocationScraper(semester, academicYear, {
    ...options,
    download: download ?? (current && !options.pdfDir),
    round: parseRound(round),
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
