/**
 * Small utility functions that don't need to be part of the main API class
 */

import { Semester } from '../types/modules';
import { Cache } from '../types/persist';
import rootLogger, { Logger } from '../services/logger';

/**
 * Construct the 4 number term code from the academic year and semester
 */
export function getTermCode(semester: number | string, academicYear: string) {
  const year = /\d\d(\d\d)/.exec(academicYear);
  if (!year) throw new RangeError('academicYear should be in the format of YYYY/YYYY or YYYY-YY');
  return `${year[1]}${semester}0`;
}

/**
 * Extract the academic year and semester from a term code
 */
export function fromTermCode(term: string): [string, Semester] {
  const year = parseInt(term.slice(0, 2), 10);
  const semester = parseInt(term.charAt(2), 10);

  return [`20${year}/20${year + 1}`, semester];
}

/**
 * Cache and return download if it succeeds, otherwise return cached data if
 * it has not expired yet
 */
export async function cacheDownload<T>(
  name: string,
  download: () => Promise<T>,
  cache: Cache<T>,
  logger: Logger = rootLogger,
): Promise<T> {
  try {
    // Try to download the data, and if successful cache it
    const data = await download();

    try {
      await cache.write(data);
    } catch (err) {
      logger.warn({ err, path: cache.path }, 'Failed to cache data');
    }

    return data;
  } catch (downloadError) {
    // If the file is not available we try to load it from cache instead
    logger.warn(downloadError, `Cannot load ${name} from API, attempting to read from cache`);

    try {
      // Deliberately awaiting on cache.read() to catch read errors
      return await cache.read();
    } catch (cacheError) {
      // Rethrow the download error if the cache is not available since an ENOTFOUND or
      // CacheExpiredError is usually not helpful
      throw downloadError;
    }
  }
}

/**
 * Retries the given promise
 */
export async function retry<T>(
  promiseFactory: () => Promise<T>,
  maxRetries: number,
  retryIf: (error: Error) => boolean = () => true,
): Promise<T> {
  try {
    return await promiseFactory();
  } catch (e) {
    // If we run out of tries, or if the given condition is not fulfilled, we
    // don't retry
    if (maxRetries <= 1 || !retryIf(e)) throw e;
    return retry(promiseFactory, maxRetries - 1, retryIf);
  }
}

/**
 * Returns true if `desc` has >3 consecutive non-breaking spaces without spaces
 * between them.
 *
 * Intended to catch cases where someone unintentially used NBSPs instead of
 * regular spaces, while still allowing intentional uses of NBSPs. The >3
 * consecutive criterion is just a simple good-enough heuristic.
 */
export function containsNbsps(desc: string): boolean {
  // \u00A0 is an NBSP
  return new RegExp(/\u00A0[^ ]*\u00A0[^ ]*\u00A0/).test(desc);
}
