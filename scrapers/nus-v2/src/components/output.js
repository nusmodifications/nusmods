// @flow

import path from 'path';
import * as fs from 'fs-extra';

import type { AcademicGroup, AcademicOrg } from '../types/api';
import type { ModuleCode, RawLesson, Semester } from '../types/modules';
import type { ModuleInfoMapped } from '../types/mapper';
import config from '../config';

const yearRoot = path.join(config.dataPath, config.academicYear.replace('/', '-'));

// Raw paths are for caching the direct and intermediate outputs from the API
const rawRoot = path.join(yearRoot, 'raw');
const rawPaths = {
  root: rawRoot,
  departments: path.join(rawRoot, 'departments.json'),
  faculties: path.join(rawRoot, 'faculties.json'),

  semesterModuleList: (semester: Semester) => path.join(rawRoot, String(semester), 'modules.json'),
};

// Output paths are for completed, public facing output from the scraper
const outputPaths = {
  root: yearRoot,

  // List of ModuleCondensed for searching
  moduleList: path.join(yearRoot, 'moduleList.json'),

  // List of partial module info for module finder
  moduleInformation: path.join(yearRoot, 'moduleInformation.json'),

  // Output for a specific module's data
  module: (moduleCode: ModuleCode) => path.join(yearRoot, 'modules', `${moduleCode}.json`),

  timetable: (moduleCode: ModuleCode, semester: Semester) =>
    path.join(yearRoot, String(semester), 'modules', moduleCode, 'timetable.json'),
};

export async function saveRawDepartments(departments: AcademicOrg[]) {
  return fs.outputJSON(rawPaths.departments, departments);
}

export async function saveRawFaculties(faculties: AcademicGroup[]) {
  return fs.outputJSON(rawPaths.faculties, faculties);
}

export async function saveRawModules(semester: Semester, modules: ModuleInfoMapped[]) {
  return fs.outputJSON(rawPaths.semesterModuleList(semester), modules);
}

export async function saveTimetable(
  semester: Semester,
  moduleCode: ModuleCode,
  timetable: RawLesson[],
) {
  const filepath = outputPaths.timetable(moduleCode, semester);
  return fs.outputJSON(filepath, timetable);
}
