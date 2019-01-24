// @flow

import '@babel/polyfill';
import './utils/sentry';

import type { CommandModule } from 'yargs';
import * as yargs from 'yargs';

import { TestApi } from './tasks';

function runTask(Task, ...params) {
  new Task(...params).run().catch((e) => console.error(e));
}

const commands: CommandModule[] = [
  {
    command: 'test',
    describe: 'run some simple tests against the API to ensure things are set up correctly',
    handler: () => runTask(TestApi),
  },
];

commands.forEach((command) => yargs.command(command));

// eslint-disable-next-line no-unused-expressions
yargs.demandCommand().help().argv;
