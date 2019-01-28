// @flow

import type { WriteOptions } from 'fs-extra';
import path from 'path';
import * as fs from 'fs-extra';

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
import { CacheExpiredError } from './errors';
import type { Venue, VenueInfo } from '../types/venues';

/**
 * Object representing a file on the filesystem that may or may not exist
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
export function getCache<T>(key: string): Cache<T> {
  const filepath = path.join(cacheRoot, `${key}.json`);

  return {
    path: filepath,

    write: (o: T) => fs.outputJSON(filepath, o, writeOptions),

    read: async (expiryInMin: number = defaultExpiry) => {
      const [data, stat] = await Promise.all([fs.readJSON(filepath), fs.stat(filepath)]);

      // Throw an error if the file has expired
      if (Date.now() - stat.mtimeMs > expiryInMin * 60 * 1000) {
        const error = new CacheExpiredError('Cache expired');
        error.path = filepath;
        error.fileModifiedTime = stat.mtimeMs;
        throw error;
      }

      return data;
    },
  };
}

/**
 * Uses a factory so that objects are not shared
 */
export function getOutput() {
  return {
    // List of ModuleCondensed for searching
    moduleList: (data: ModuleCondensed[]) =>
      fs.outputJSON(path.join(yearRoot, 'moduleList.json'), data, writeOptions),

    // List of partial module info for module finder
    moduleInformation: (data: ModuleInformation[]) =>
      fs.outputJSON(path.join(yearRoot, 'moduleInformation.json'), data, writeOptions),

    // List of venues
    venueList: (semester: Semester, data: Venue[]) =>
      fs.outputJSON(path.join(yearRoot, String(semester), 'venues.json'), data, writeOptions),

    // List of venues mapped to their availability
    venueInformation: (semester: Semester, data: VenueInfo) =>
      fs.outputJSON(
        path.join(yearRoot, String(semester), 'venueInformation.json'),
        data,
        writeOptions,
      ),

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
