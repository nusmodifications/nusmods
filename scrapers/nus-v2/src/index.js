// @flow

import '@babel/polyfill';
import './utils/sentry';

import type { CommandModule } from 'yargs';
import * as yargs from 'yargs';
import { size } from 'lodash';

import {
  TestApi,
  GetFacultyDepartment,
  GetSemesterData,
  CollateVenues,
  CollateModules,
} from './tasks';
import getFileSystem from './services/fs';
import logger from './services/logger';
import { Semesters } from './types/modules';

function runTask(Task, ...params) {
  new Task(...params).run().catch((e) => {
    // TODO: Proper logging
    console.error(`[${e.constructor.name}] ${e.message}`);
    console.error(e.stack);
  });
}

const files = getFileSystem();

const commands: CommandModule[] = [
  {
    command: 'test',
    describe: 'run some simple tests against the API to ensure things are set up correctly',
    handler: () => runTask(TestApi),
  },
  {
    command: 'departments',
    describe: 'download data for all active departments and faculties',
    handler: () => runTask(GetFacultyDepartment),
  },
  {
    command: 'semester <sem>',
    describe: 'download all data for the given semester',
    builder: {
      sem: {
        type: 'integer',
      },
    },
    handler: (argv) => {
      const { sem } = argv;
      if (sem < 1 || sem > 4) throw new RangeError('Semester out of range. Expect 1, 2, 3 or 4.');

      new GetFacultyDepartment()
        .run()
        .then((organizations) => new GetSemesterData(sem).run(organizations))
        .then((modules) => {
          logger.info(`Collected data for ${modules.length} modules`);
        });
    },
  },
  {
    command: 'venue <sem>',
    describe: 'collate venue for given semester',
    builder: {
      sem: {
        type: 'integer',
      },
    },
    handler: ({ sem }) => {
      if (sem < 1 || sem > 4) throw new RangeError('Semester out of range. Expect 1, 2, 3 or 4.');

      files.raw
        .semester(sem)
        .moduleData.read()
        .then((semesterModuleData) => new CollateVenues(sem).run(semesterModuleData))
        .then((venues) => logger.info(`Collated ${size(venues)} venues`));
    },
  },
  {
    command: 'combine',
    describe: 'combine semester data for modules',
    handler: () => {
      Promise.all(
        Semesters.map((semester) =>
          files.raw
            .semester(semester)
            .moduleData.read()
            .catch(() => {
              logger.warn(`No semester data available for ${semester}`);
              return [];
            }),
        ),
      ).then((semesterData) => new CollateModules().run(semesterData));
    },
  },
];

commands.forEach((command) => yargs.command(command));

// eslint-disable-next-line no-unused-expressions
yargs.demandCommand().help().argv;
