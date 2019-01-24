// @flow

import "@babel/polyfill";
import './src/utils/sentry';

import * as yargs from 'yargs';

const argv = yargs
  .command('test', '')
