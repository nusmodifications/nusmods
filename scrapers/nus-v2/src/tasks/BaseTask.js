// @flow

import api from '../components/api';
import logger from '../components/logger';
import getFileSystem from '../components/fs';

/**
 * Base task class. Dependencies and components are instance properties
 * which can be overridden in tests with mocks.
 */
export default class BaseTask {
  // For accessing the remote class and module API. By default use
  // the global singleton API instance
  api = api;

  // For storing data to the file system
  fs = getFileSystem();

  rootLogger = logger;
}
