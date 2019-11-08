import { once } from 'lodash';

import api from '../services/nus-api';
import logger, { Logger } from '../services/logger';
import { getCacheFactory, CombinedPersist, getFileSystemWriter } from '../services/io';
import { Cache, Persist } from '../types/persist';
import config from '../config';

// Always persist to ES in production, otherwise persist to FS only
const useElasticSearch = process.env.NODE_ENV === 'production' ? true : !!config.elasticConfig;
const elasticConfigWarning = once(() => {
  logger.warn('Data is not persisted to ElasticSearch because it is not configured');
});

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

    if (useElasticSearch) {
      this.io = new CombinedPersist(academicYear);
    } else {
      elasticConfigWarning();
      this.io = getFileSystemWriter(academicYear);
    }

    this.getCache = getCacheFactory(academicYear);
  }

  // For accessing the remote class and module API. By default use
  // the global singleton API instance
  api = api;

  protected rootLogger = logger;

  logger: Logger = logger;
}
