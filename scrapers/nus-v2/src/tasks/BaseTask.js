// @flow

import { Logger } from 'bunyan';

import api from '../services/api';
import logger from '../services/logger';
import { getDataWriter } from '../services/io';

/**
 * Base task class. Dependencies and components are instance properties
 * which can be overridden in tests with mocks.
 */
export default class BaseTask {
  // For accessing the remote class and module API. By default use
  // the global singleton API instance
  api = api;

  // For storing data to the file system
  io = getDataWriter();

  rootLogger = logger;

  logger: Logger;
}
