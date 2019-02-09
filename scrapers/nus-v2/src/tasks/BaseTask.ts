import api from '../services/nus-api';
import logger, { Logger } from '../services/logger';
import { getDataWriter, getCacheFactory, Cache } from '../services/io';

/**
 * Base task class. Dependencies and components are instance properties
 * which can be overridden in tests with mocks.
 */
export default class BaseTask {
  protected academicYear: string;

  // For storing data to the file system
  io: ReturnType<typeof getDataWriter>;

  // To get a cache for data of T type
  protected getCache: <T>(key: string, expiry?: number) => Cache<T>;

  constructor(academicYear: string) {
    this.academicYear = academicYear;

    this.io = getDataWriter(academicYear);
    this.getCache = getCacheFactory(academicYear);
  }

  // For accessing the remote class and module API. By default use
  // the global singleton API instance
  api = api;

  protected rootLogger = logger;

  logger: Logger;
}
