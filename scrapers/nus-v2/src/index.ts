// Imported for side effects, so they have to be right at the top
import './utils/sentry';

import * as yargs from 'yargs';
import { size, mapValues } from 'lodash';

import logger from './services/logger';
import { Aliases, Semesters } from './types/modules';

import TestApi from './tasks/TestApi';
import GetFacultyDepartment from './tasks/GetFacultyDepartment';
import GetSemesterData from './tasks/GetSemesterData';
import CollateVenues from './tasks/CollateVenues';
import CollateModules from './tasks/CollateModules';
import DataPipeline from './tasks/DataPipeline';

import config from './config';
import MigrateV1ToV2 from './tasks/MigrateV1ToV2';

function handleFatalError(e: Error): void {
  logger.fatal(e, 'Fatal error');
  // Do not use process.exit because that will quit without waiting for the
  // event loop to empty, which may cut off logs or IO operations
  process.exitCode = 1;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function run(fn: (...args: any[]) => Promise<any>) {
  return (...args: any[]) => fn(...args).catch(handleFatalError);
}
/* eslint-enable */

const parameters: Record<string, yargs.Options> = {
  sem: {
    type: 'number',
    choices: Semesters,
  },
  year: {
    type: 'string',
    default: config.academicYear,
    coerce: (value: string) => {
      // Handle year given in two or four number form
      if (value.length === 2) return `20${value}/20${+value + 1}`;
      if (value.length === 4) return `${value}-${+value + 1}`;
      return value.replace('-', '/');
    },
  },
};

/* eslint-disable no-await-in-loop */

// eslint-disable-next-line no-unused-expressions
yargs
  .command({
    command: 'test',
    describe: 'run some simple tests against the API to ensure things are set up correctly',
    handler: run(() => new TestApi(config.academicYear).run()),
  })
  .command({
    command: 'departments [year]',
    aliases: ['department', 'faculty', 'faculties'],
    describe: 'download data for all active departments and faculties',
    builder: {
      year: parameters.year,
    },
    handler: run(({ year }) => new GetFacultyDepartment(year).run()),
  })
  .command({
    command: 'semester <sem> [year]',
    describe: 'download all data for the given semester',
    builder: {
      sem: parameters.sem,
      year: parameters.year,
    },
    handler: run(async ({ sem, year }) => {
      const organizations = await new GetFacultyDepartment(year).run();
      const modules = await new GetSemesterData(sem).run(organizations);
      logger.info(`Collected data for ${modules.length} modules`);
    }),
  })
  .command({
    command: 'venue [year] <sem>',
    aliases: ['venues'],
    describe: 'collate venue for given semester',
    builder: {
      sem: parameters.sem,
      year: parameters.year,
    },
    handler: run(async ({ sem, year }) => {
      const modules = await new GetSemesterData(sem, year).outputCache.read();
      const { venues } = await new CollateVenues(sem, year).run(modules);
      logger.info(`Collated ${size(venues)} venues`);
    }),
  })
  .command({
    command: 'combine [year]',
    describe: 'combine semester data for modules',
    builder: {
      year: parameters.year,
    },
    handler: run(async ({ year }) => {
      const aliases = [];
      const semesterData = [];

      for (const semester of Semesters) {
        const semesterAliases = await new CollateVenues(semester, year).aliasCache.read().catch(
          (e): Aliases => {
            logger.warn(e, `No module alias info available for ${semester}`);
            return {};
          },
        );
        aliases.push(mapValues(semesterAliases, (moduleCodes) => new Set(moduleCodes)));

        const modules = await new GetSemesterData(semester, year).outputCache.read().catch((e) => {
          logger.warn(e, `No semester data available for ${semester}`);
          return [];
        });
        semesterData.push(modules);
      }

      await new CollateModules().run({ semesterData, aliases });
    }),
  })
  .command({
    command: 'all [year]',
    describe: 'run all tasks in a single pipeline',
    builder: {
      year: parameters.year,
    },
    handler: run(({ year }) => new DataPipeline(year).run()),
  })
  .command({
    command: 'migrate [year]',
    describe: 'move v1 modules to v2 modules format',
    builder: {
      year: parameters.year,
    },
    handler: run(async ({ year }) => {
      // Always use current year because v2 API endpoint may not return data for past years
      const input = await new GetFacultyDepartment(config.academicYear).run();
      const convertedModules = await new MigrateV1ToV2(year).run(input);
      logger.info(`Converted ${convertedModules.length} modules`);
    }),
  })
  .demandCommand()
  .strict()
  .help().argv;
