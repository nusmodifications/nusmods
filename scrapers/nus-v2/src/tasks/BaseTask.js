// @flow

import api from '../services/nus-api';
import logger, { Logger } from '../services/logger';
import { getDataWriter, getCacheFactory, type Cache } from '../services/io';

/**
 * Base task class. Dependencies and components are instance properties
 * which can be overridden in tests with mocks.
 */
export default class BaseTask {
  academicYear: string;

  // For storing data to the file system
  io: $Call<typeof getDataWriter, string>;

  // To get a cache for data of T type
  getCache: <T>(key: string, expiry?: number) => Cache<T>;

  constructor(academicYear: string) {
    this.academicYear = academicYear;

    this.io = getDataWriter(academicYear);
    this.getCache = getCacheFactory(academicYear);
  }

  // For accessing the remote class and module API. By default use
  // the global singleton API instance
  api = api;

  rootLogger = logger;

  logger: Logger;
}
