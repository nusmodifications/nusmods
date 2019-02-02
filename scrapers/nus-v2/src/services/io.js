// @flow

/**
 * Contains Cache, which is used to store temporary expiring data
 * (usually directly from the API), and the factory for DataWriter
 * which is how Tasks primarily save their results to disk.
 */

import type { WriteOptions } from 'fs-extra';
import * as fs from 'fs-extra';
import path from 'path';

import type {
  Module,
  ModuleCode,
  ModuleCondensed,
  ModuleInformation,
  RawLesson,
  Semester,
  SemesterData,
} from '../types/modules';

import config from '../config';
import { CacheExpiredError } from '../utils/errors';
import type { Venue, VenueInfo } from '../types/venues';

/**
 * Object representing a unique cache file on disk
 */
export type Cache<T> = {
  path: string,
  write: (T) => Promise<void>,
  read: () => Promise<T>,
};

const defaultExpiry = 24 * 60; // 1 day

// Use 2 spaces for easier debugging in development
const writeOptions: WriteOptions = {
  spaces: process.env.NODE_ENV === 'production' ? 0 : 2,
};

// Root directories
const yearRoot = path.join(config.dataPath, config.academicYear.replace('/', '-'));
const cacheRoot = path.join(yearRoot, 'raw');

/**
 * Get a cache for a specific file
 */
export function getCache<T>(key: string, expiryInMin: number = defaultExpiry): Cache<T> {
  const filepath = path.join(cacheRoot, `${key}.json`);

  return {
    path: filepath,

    expiry: expiryInMin,

    write: (o: T) => fs.outputJSON(filepath, o, writeOptions),

    read: async () => {
      const [data, stat] = await Promise.all([fs.readJSON(filepath), fs.stat(filepath)]);

      // Throw an error instead of returning stale data if the file has expired
      if (Date.now() - stat.mtimeMs > expiryInMin * 60 * 1000) {
        throw new CacheExpiredError('Cache expired', filepath, stat.mtimeMs);
      }

      return data;
    },
  };
}

/**
 * Create an object that maps each of the file output from the scraper.
 * Uses a factory so that objects are not shared. Since the Tasks only see
 * a function to send output to, this can be replaced with any persistence
 * mechanism in the future, eg. a database
 */
export function getDataWriter() {
  return {
    // List of ModuleCondensed for searching
    moduleList: (data: ModuleCondensed[]) =>
      fs.outputJSON(path.join(yearRoot, 'moduleList.json'), data, writeOptions),

    // List of partial module info for module finder
    moduleInformation: (data: ModuleInformation[]) =>
      fs.outputJSON(path.join(yearRoot, 'moduleInformation.json'), data, writeOptions),

    // List of venue codes used for searching
    venueList: (semester: Semester, data: Venue[]) =>
      fs.outputJSON(path.join(yearRoot, String(semester), 'venues.json'), data, writeOptions),

    // List of venues mapped to their availability
    venueInformation: (semester: Semester, data: VenueInfo) =>
      fs.outputJSON(
        path.join(yearRoot, String(semester), 'venueInformation.json'),
        data,
        writeOptions,
      ),

    // List of faculties and their departments
    facultyDepartments: (data: { [string]: string[] }) =>
      fs.outputJSON(path.join(yearRoot, 'facultyDepartments.json'), data, writeOptions),

    // Output for a specific module's data
    module: (moduleCode: ModuleCode, data: Module) =>
      fs.outputJSON(path.join(yearRoot, 'modules', `${moduleCode}.json`), data, writeOptions),

    timetable: (semester: Semester, moduleCode: ModuleCode, data: RawLesson[]) =>
      fs.outputJSON(
        path.join(yearRoot, String(semester), moduleCode, 'timetable.json'),
        data,
        writeOptions,
      ),

    semesterData: (semester: Semester, moduleCode: ModuleCode, data: SemesterData) =>
      fs.outputJSON(
        path.join(yearRoot, String(semester), moduleCode, 'semesterData.json'),
        data,
        writeOptions,
      ),
  };
}
