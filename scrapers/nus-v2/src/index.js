// @flow

import '@babel/polyfill';
import './utils/sentry';

import type { CommandModule } from 'yargs';
import * as yargs from 'yargs';
import { size } from 'lodash';

import logger from './services/logger';
import { Semesters } from './types/modules';

import TestApi from './tasks/TestApi';
import GetFacultyDepartment from './tasks/GetFacultyDepartment';
import GetSemesterData, { semesterModuleCache } from './tasks/GetSemesterData';
import CollateVenues from './tasks/CollateVenues';
import CollateModules from './tasks/CollateModules';
import DataPipeline from './tasks/DataPipeline';

function handleFatalError(e: Error) {
  logger.fatal(e, 'Fatal error');
  process.exitCode = 1;
}

function runTask(Task) {
  new Task().run().catch(handleFatalError);
}

const commands: CommandModule[] = [
  {
    command: 'test',
    describe: 'run some simple tests against the API to ensure things are set up correctly',
    handler: () => runTask(TestApi),
  },
  {
    command: 'departments',
    aliases: ['department', 'faculty', 'faculties'],
    describe: 'download data for all active departments and faculties',
    handler: () => runTask(GetFacultyDepartment),
  },
  {
    command: 'semester <sem>',
    describe: 'download all data for the given semester',
    builder: {
      sem: {
        choices: Semesters,
      },
    },
    handler({ sem }) {
      new GetFacultyDepartment()
        .run()
        .then((organizations) => new GetSemesterData(sem).run(organizations))
        .then((modules) => {
          logger.info(`Collected data for ${modules.length} modules`);
        })
        .catch(handleFatalError);
    },
  },
  {
    command: 'venue <sem>',
    aliases: ['venues'],
    describe: 'collate venue for given semester',
    builder: {
      sem: {
        choices: Semesters,
      },
    },
    handler({ sem }) {
      semesterModuleCache(sem)
        .read()
        .then((semesterModuleData) => new CollateVenues(sem).run(semesterModuleData))
        .then((venues) => logger.info(`Collated ${size(venues)} venues`))
        .catch(handleFatalError);
    },
  },
  {
    command: 'combine',
    describe: 'combine semester data for modules',
    handler() {
      Promise.all(
        Semesters.map(async (semester) => {
          try {
            return await semesterModuleCache(semester).read();
          } catch (e) {
            logger.warn(`No semester data available for ${semester}`);
            return [];
          }
        }),
      )
        .then((semesterData) => new CollateModules().run(semesterData))
        .catch(handleFatalError);
    },
  },
  {
    command: 'all',
    describe: 'run all tasks in a single pipeline',
    handler: () => runTask(DataPipeline),
  },
];

commands.forEach((command) => yargs.command(command));

// eslint-disable-next-line no-unused-expressions
yargs
  .demandCommand()
  .strict()
  .help().argv;
