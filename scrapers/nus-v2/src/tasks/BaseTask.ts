import api from '../services/nus-api';
import logger, { Logger } from '../services/logger';
import { getCacheFactory, getDataWriter } from '../services/io';
import { Cache, Persist } from '../types/persist';

/**
 * Base task class. Dependencies and components are instance properties
 * which can be overridden in tests with mocks.
 */
export default abstract class BaseTask {
  protected academicYear: string;

  // For storing data to the file system
  io: Persist;

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

  logger: Logger = logger;
}
