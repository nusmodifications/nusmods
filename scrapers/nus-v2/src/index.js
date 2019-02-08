// @flow

// Imported for side effects, so they have to be right at the top
import '@babel/polyfill';
import './utils/sentry';

import type { CommandModule } from 'yargs';
import * as yargs from 'yargs';
import { size } from 'lodash';

import logger from './services/logger';
import { Semesters } from './types/modules';

import TestApi from './tasks/TestApi';
import GetFacultyDepartment from './tasks/GetFacultyDepartment';
import GetSemesterData from './tasks/GetSemesterData';
import CollateVenues from './tasks/CollateVenues';
import CollateModules from './tasks/CollateModules';
import DataPipeline from './tasks/DataPipeline';

import config from './config';

function handleFatalError(e: Error) {
  logger.fatal(e, 'Fatal error');
  process.exitCode = 1;
}

function run(fn: (...args: any[]) => Promise<any>) {
  return (...args) => fn(...args).catch(handleFatalError);
}

const parameters = {
  sem: {
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

const commands: CommandModule[] = [
  {
    command: 'test',
    describe: 'run some simple tests against the API to ensure things are set up correctly',
    handler: run(new TestApi(config.academicYear).run),
  },
  {
    command: 'departments [year]',
    aliases: ['department', 'faculty', 'faculties'],
    describe: 'download data for all active departments and faculties',
    builder: {
      year: parameters.year,
    },
    handler: run(({ year }) => new GetFacultyDepartment(year).run()),
  },
  {
    command: 'semester [year] <sem>',
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
  },
  {
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
  },
  {
    command: 'combine [year]',
    describe: 'combine semester data for modules',
    builder: {
      year: parameters.year,
    },
    handler: run(async ({ year }) => {
      const modules = await Promise.all(
        Semesters.map((semester) =>
          new GetSemesterData(semester, year).outputCache.read().catch((e) => {
            logger.warn(e, `No semester data available for ${semester}`);
            return [];
          }),
        ),
      );

      await new CollateModules().run(modules);
    }),
  },
  {
    command: 'all',
    describe: 'run all tasks in a single pipeline',
    handler: run(({ year }) => new DataPipeline(year).run()),
  },
];

commands.forEach((command) => yargs.command(command));

// eslint-disable-next-line no-unused-expressions
yargs
  .demandCommand()
  .strict()
  .help().argv;
