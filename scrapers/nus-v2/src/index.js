// @flow

import '@babel/polyfill';
import './utils/sentry';

import type { CommandModule } from 'yargs';
import * as yargs from 'yargs';

import { TestApi, GetFacultyDepartment } from './tasks';

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
];

commands.forEach((command) => yargs.command(command));

// eslint-disable-next-line no-unused-expressions
yargs.demandCommand().help().argv;
