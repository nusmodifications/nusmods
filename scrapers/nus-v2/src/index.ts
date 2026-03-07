// Imported for side effects, so they have to be right at the top
import './utils/sentry';

import * as yargs from 'yargs';
import { size, mapValues } from 'lodash';

import logger from './services/logger';
import { Aliases, Semesters } from './types/modules';

import TestApi from './tasks/TestApi';
import GetFacultyDepartment from './tasks/GetFacultyDepartment';
import GetAllModules from './tasks/GetAllModules';
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

function run(fn: (...args: Array<any>) => Promise<any>) {
  return (...args: Array<any>) => fn(...args).catch(handleFatalError);
}

const parameters: Record<string, yargs.Options> = {
  sem: {
    choices: Semesters,
    type: 'number',
  },
  year: {
    coerce: (value: string) => {
      // Handle year given in two or four number form
      if (value.length === 2) {
        return `20${value}/20${+value + 1}`;
      }
      if (value.length === 4) {
        return `${value}-${+value + 1}`;
      }
      return value.replace('-', '/');
    },
    default: config.academicYear,
    type: 'string',
  },
};

yargs
  .command({
    command: 'test',
    describe: 'run some simple tests against the API to ensure things are set up correctly',
    handler: run(() => new TestApi(config.academicYear).run()),
  })
  .command({
    aliases: ['department', 'faculty', 'faculties'],
    builder: {
      year: parameters.year,
    },
    command: 'departments [year]',
    describe: 'download data for all active departments and faculties',
    handler: run(({ year }) => new GetFacultyDepartment(year).run()),
  })
  .command({
    builder: {
      sem: parameters.sem,
      year: parameters.year,
    },
    command: 'semester <sem> [year]',
    describe: 'download all data for the given semester',
    handler: run(async ({ sem, year }) => {
      const organizations = await new GetFacultyDepartment(year).run();
      const allModules = await new GetAllModules(year).run({
        faculties: organizations.faculties,
      });
      const modules = await new GetSemesterData(sem).run({
        ...organizations,
        modules: allModules,
      });
      logger.info(`Collected data for ${modules.length} modules`);
    }),
  })
  .command({
    aliases: ['venues'],
    builder: {
      sem: parameters.sem,
      year: parameters.year,
    },
    command: 'venue [year] <sem>',
    describe: 'collate venue for given semester',
    handler: run(async ({ sem, year }) => {
      const modules = await new GetSemesterData(sem, year).outputCache.read();
      const { venues } = await new CollateVenues(sem, year).run(modules);
      logger.info(`Collated ${size(venues)} venues`);
    }),
  })
  .command({
    builder: {
      year: parameters.year,
    },
    command: 'combine [year]',
    describe: 'combine semester data for modules',
    handler: run(async ({ year }) => {
      const aliases = [];
      const semesterData = [];

      for (const semester of Semesters) {
        const semesterAliases = await new CollateVenues(semester, year).aliasCache
          .read()
          .catch((error): Aliases => {
            logger.warn(error, `No module alias info available for ${semester}`);
            return {};
          });
        aliases.push(mapValues(semesterAliases, (moduleCodes) => new Set(moduleCodes)));

        const modules = await new GetSemesterData(semester, year).outputCache
          .read()
          .catch((error) => {
            logger.warn(error, `No semester data available for ${semester}`);
            return [];
          });
        semesterData.push(modules);
      }

      await new CollateModules().run({ aliases, semesterData });
    }),
  })
  .command({
    builder: {
      year: parameters.year,
    },
    command: 'all [year]',
    describe: 'run all tasks in a single pipeline',
    handler: run(({ year }) => new DataPipeline(year).run()),
  })
  .command({
    builder: {
      year: parameters.year,
    },
    command: 'migrate [year]',
    describe: 'move v1 modules to v2 modules format',
    handler: run(async ({ year }) => {
      // Always use current year because v2 API endpoint may not return data for past years
      const input = await new GetFacultyDepartment(config.academicYear).run();
      const convertedModules = await new MigrateV1ToV2(year).run(input);
      logger.info(`Converted ${convertedModules.length} modules`);
    }),
  })
  .demandCommand()
  .strict()
  .help()
  .parseAsync();
