// @flow

/**
 * Small utility functions that don't need to be part of the main API class
 */

import { Logger } from 'bunyan';
import type { Semester } from '../types/modules';
import type { File } from '../components/fs';
import rootLogger from '../components/logger';

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

export async function cacheDownload<T>(
  name: string,
  download: () => Promise<T>,
  cache: File<T>,
  logger: Logger = rootLogger,
): Promise<T> {
  try {
    // Try to download the data, and if successful cache it
    const data = await download();

    try {
      await cache.write(data);
    } catch (e) {
      logger.warn(`Failed to cache data to ${cache.path}`);
    }

    return data;
  } catch (e) {
    // If the file is not available we try to load it from cache instead
    logger.warn(e, `Cannot load ${name} from API, attempting to read from cache`);
    return cache.read();
  }
}
