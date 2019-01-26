// @flow

import '@babel/polyfill';
import './utils/sentry';

import type { CommandModule } from 'yargs';
import * as yargs from 'yargs';

import { TestApi, GetFacultyDepartment } from './tasks';
import config from './config';
import GetSemesterData from './tasks/GetSemesterData';

function runTask(Task, ...params) {
  new Task(...params).run().catch((e) => {
    // TODO: Proper logging
    console.error(`[${e.constructor.name}] ${e.message}`);
    console.error(e.stack);
  });
}

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
    command: 'semester [year] <sem>',
    describe: 'download all data for the given semester',
    builder: {
      year: {
        default: config.academicYear,
        type: 'string',
      },
      sem: {
        type: 'integer',
      },
    },
    handler: (argv) => {
      (async () => {
        const { sem, year } = argv;
        if (sem < 1 || sem > 4) throw new RangeError('Semester out of range. Expect 1, 2, 3 or 4.');

        const getOrganizations = new GetFacultyDepartment();
        const organizations = await getOrganizations.run();

        const getSemesterData = new GetSemesterData(sem, year);
        const data = await getSemesterData.run(organizations);

        console.log(`Collected data for ${data.length} modules`);
      })();
    },
  },
];

commands.forEach((command) => yargs.command(command));

// eslint-disable-next-line no-unused-expressions
yargs.demandCommand().help().argv;
