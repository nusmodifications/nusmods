/**
 * Contains Cache, which is used to store temporary expiring data
 * (usually directly from the API), and the factory for DataWriter
 * which is how Tasks primarily save their results to disk.
 */

import * as fs from 'fs-extra';
import path from 'path';

import {
  Aliases,
  Module,
  ModuleCode,
  ModuleCondensed,
  ModuleInformation,
  RawLesson,
  Semester,
  SemesterData,
} from '../../types/modules';
import { Venue, VenueInfo } from '../../types/venues';
import { Cache, Persist } from '../../types/persist';
import config from '../../config';
import { CacheExpiredError } from '../../utils/errors';
import { MPEModule } from 'types/mpe';

const defaultExpiry = 24 * 60; // 1 day

// Use 2 spaces for easier debugging in development
const writeOptions: fs.WriteOptions = {
  spaces: process.env.NODE_ENV === 'production' ? 0 : 2,
};

const getFileRoot = (academicYear: string) =>
  path.join(config.dataPath, academicYear.replace('/', '-'));

/**
 * Create a cache factory for BaseTask
 */
export function getCacheFactory(academicYear: string) {
  const cacheRoot = path.join(getFileRoot(academicYear), 'cache');

  return function getCache<T>(key: string, expiryInMin: number = defaultExpiry): Cache<T> {
    const filepath = path.join(cacheRoot, `${key}.json`);

    return {
      path: filepath,

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
  };
}

/**
 * Create an object that maps each of the file output from the scraper.
 * Uses a factory so that objects are not shared. Since the Tasks only see
 * a function to send output to, this can be replaced with any persistence
 * mechanism in the future, eg. a database
 */
export function getFileSystemWriter(academicYear: string): Persist {
  const yearRoot = getFileRoot(academicYear);

  // Directory structure
  //
  // -- /2018-2019 (year)
  //  |--- facultyDepartments.json
  //  |--- aliases.json
  //  |--- moduleList.json
  //  |--- moduleInformation.json
  //  |--- /modules
  //  |    |--- CS1010.json
  //  |    |--- ...
  //  |
  //  |--- /semesters
  //       |--- /1 (semester)
  //            |--- venues.json
  //            |--- venueInformation.json
  //            |--- /CS1010 (module)
  //            |    |--- timetable.json
  //            |    |--- semesterData.json
  //            |--- /...
  return {
    // ///////////////////////////////////////////////////////////
    // Per year information
    // ///////////////////////////////////////////////////////////

    // List of ModuleCondensed for searching
    moduleList: (data: ModuleCondensed[]) =>
      fs.outputJSON(path.join(yearRoot, 'moduleList.json'), data, writeOptions),

    // List of partial module info for module finder
    moduleInfo: (data: ModuleInformation[]) =>
      fs.outputJSON(path.join(yearRoot, 'moduleInfo.json'), data, writeOptions),

    // List of modules that are participating in NUS's module planning exercise (MPE)
    mpeModules: (data: MPEModule[]) =>
      fs.outputJSON(path.join(yearRoot, 'mpeModules.json'), data, writeOptions),

    // DEPRECATED. TODO: Remove after AY19/20 starts.
    // List of partial module info for module finder
    moduleInformation: (data: ModuleInformation[]) =>
      fs.outputJSON(path.join(yearRoot, 'moduleInformation.json'), data, writeOptions),

    // Mapping modules to other dual coded modules
    moduleAliases: (data: Aliases) =>
      fs.outputJSON(path.join(yearRoot, 'aliases.json'), data, writeOptions),

    // List of faculties and their departments
    facultyDepartments: (data: { [faculty: string]: string[] }) =>
      fs.outputJSON(path.join(yearRoot, 'facultyDepartments.json'), data, writeOptions),

    // ///////////////////////////////////////////////////////////
    // Per module information
    // ///////////////////////////////////////////////////////////

    // Output for a specific module's data
    module: (moduleCode: ModuleCode, data: Module) =>
      fs.outputJSON(path.join(yearRoot, 'modules', `${moduleCode}.json`), data, writeOptions),

    timetable: (semester: Semester, moduleCode: ModuleCode, data: RawLesson[]) =>
      fs.outputJSON(
        path.join(yearRoot, 'semesters', String(semester), moduleCode, 'timetable.json'),
        data,
        writeOptions,
      ),

    semesterData: (semester: Semester, moduleCode: ModuleCode, data: SemesterData) =>
      fs.outputJSON(
        path.join(yearRoot, 'semesters', String(semester), moduleCode, 'semesterData.json'),
        data,
        writeOptions,
      ),

    getModuleCodes: async () => {
      let files: ModuleCode[];
      try {
        files = await fs.readdir(path.join(yearRoot, 'modules'));
      } catch (e) {
        if (e.code === 'ENOENT') {
          files = [];
        } else {
          throw e;
        }
      }

      return files.map((filename) => path.basename(filename, '.json'));
    },

    deleteModule: async (moduleCode: ModuleCode) => {
      await Promise.all([
        fs.remove(path.join(yearRoot, 'modules', `${moduleCode}.json`)),
        fs.remove(path.join(yearRoot, 'semesters', '1', moduleCode)),
        fs.remove(path.join(yearRoot, 'semesters', '2', moduleCode)),
        fs.remove(path.join(yearRoot, 'semesters', '3', moduleCode)),
        fs.remove(path.join(yearRoot, 'semesters', '4', moduleCode)),
      ]);
    },

    // ///////////////////////////////////////////////////////////
    // Per semester information
    // ///////////////////////////////////////////////////////////

    // List of venue codes used for searching
    venueList: (semester: Semester, data: Venue[]) =>
      fs.outputJSON(
        path.join(yearRoot, 'semesters', String(semester), 'venues.json'),
        data,
        writeOptions,
      ),

    // List of venues mapped to their availability
    venueInformation: (semester: Semester, data: VenueInfo) =>
      fs.outputJSON(
        path.join(yearRoot, 'semesters', String(semester), 'venueInformation.json'),
        data,
        writeOptions,
      ),
  };
}
