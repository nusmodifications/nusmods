// @flow

import api from '../services/api';
import logger from '../services/logger';
import { getOutput, getCache } from '../services/output';

/**
 * Base task class. Dependencies and components are instance properties
 * which can be overridden in tests with mocks.
 */
export default class BaseTask {
  // For accessing the remote class and module API. By default use
  // the global singleton API instance
  api = api;

  // For storing data to the file system
  output = getOutput();

  // To cache intermediate results (subclasses call this to get a single
  // Cache<T> object for each thing they need to cache)
  getCache = getCache;

  rootLogger = logger;
}
