import { parseArgs } from 'node:util';
import { scraperPeriod } from 'nusmods-academic-calendar';

import { DemandAllocationScraper } from './scraper';
import type { Semester } from './types';

const usage = `Usage:
  pnpm dev all                   Download all rounds for the configured semester
  pnpm dev import <sem> <year>    Import PDFs from the archive for that period

Options:
  --output-dir <dir>  Override the academic-year API output directory
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

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      help: { short: 'h', type: 'boolean' },
      'output-dir': { type: 'string' },
    },
  });
  const [command, ...args] = positionals;
  const outputDir = values['output-dir'];
  if (values.help || (command === 'help' && !args.length)) {
    console.log(usage);
  } else if (command === 'all' && args.length === 0) {
    await new DemandAllocationScraper(
      scraperPeriod.semester,
      scraperPeriod.academicYear,
      outputDir,
    ).download();
  } else if (command === 'import' && args.length === 2) {
    const [semester, year] = args;
    await new DemandAllocationScraper(
      parseSemester(semester),
      normalizeAcademicYear(year),
      outputDir,
    ).importArchive();
  } else {
    throw new Error(usage);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
