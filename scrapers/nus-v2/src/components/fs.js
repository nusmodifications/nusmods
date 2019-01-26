// @flow

import path from 'path';
import * as fs from 'fs-extra';

import type { AcademicGroup, AcademicOrg, ModuleExam } from '../types/api';
import type { Module, ModuleCode, RawLesson, Semester, SemesterData } from '../types/modules';
import type { ModuleInfoMapped, SemesterModuleData } from '../types/mapper';
import config from '../config';
import { CacheExpiredError } from './errors';

/**
 * Object representing a file on the filesystem that may or may not exist
 */
export type File<T> = {
  path: string,
  write: (T) => Promise<void>,
  read: () => Promise<T>,
};

const defaultExpiry = 24 * 60; // 1 day

function file<T>(filepath: string, expirationInMin: number = defaultExpiry): File<T> {
  return {
    path: filepath,
    write: (o) => fs.outputJSON(filepath, o),
    read: async () => {
      const [data, stat] = await Promise.all([fs.readJSON(filepath), fs.stat(filepath)]);

      // Throw an error if the file has expired
      if (Date.now() - stat.atimeMs > expirationInMin * 60 * 1000) {
        throw new CacheExpiredError();
      }

      return data;
    },
  };
}

// Root directories
const yearRoot = path.join(config.dataPath, config.academicYear.replace('/', '-'));
const rawRoot = path.join(yearRoot, 'raw');

/**
 * Uses a factory so that objects are not shared
 */
export default function getFileSystem() {
  return {
    // Raw paths are for caching the direct and intermediate outputs from the API
    raw: {
      // Departments and faculties rarely change, so we keep them for one week
      departments: file<AcademicOrg[]>(path.join(rawRoot, 'departments.json'), 7 * 24 * 60),
      faculties: file<AcademicGroup[]>(path.join(rawRoot, 'faculties.json'), 7 * 24 * 60),

      semester: (semester: Semester) => ({
        modules: file<ModuleInfoMapped[]>(path.join(rawRoot, String(semester), 'modules.json')),
        moduleData: file<SemesterModuleData[]>(
          path.join(rawRoot, String(semester), 'moduleData.json'),
        ),
        exams: file<ModuleExam[]>(path.join(rawRoot, String(semester), 'exams.json')),
      }),
    },

    output: {
      // List of ModuleCondensed for searching
      // moduleList: file<ModuleCondensed[]>(path.join(yearRoot, 'moduleList.json')),

      // List of partial module info for module finder
      moduleInformation: file<Module[]>(path.join(yearRoot, 'moduleInformation.json')),

      // Output for a specific module's data
      module: (moduleCode: ModuleCode) =>
        file<Module>(path.join(yearRoot, 'modules', `${moduleCode}.json`)),

      timetable: (semester: Semester, moduleCode: ModuleCode) =>
        file<RawLesson[]>(path.join(yearRoot, String(semester), moduleCode, 'timetable.json')),
      semesterData: (semester: Semester, moduleCode: ModuleCode) =>
        file<SemesterData>(path.join(yearRoot, String(semester), moduleCode, 'semesterData.json')),
    },
  };
}
