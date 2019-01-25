// @flow

import path from 'path';
import * as fs from 'fs-extra';

import type { AcademicGroup, AcademicOrg } from '../types/api';
import type { Semester } from '../types/modules';
import { Semesters } from '../types/modules';
import config from '../config';

const yearRoot = path.join(config.dataPath, config.academicYear);

// Raw paths are for caching the direct outputs from the API
const rawRoot = path.join(yearRoot, 'raw');
const rawPaths = {
  root: rawRoot,
  departments: path.join(rawRoot, 'departments.json'),
  faculties: path.join(rawRoot, 'faculties.json'),
  semesterDir: (semester: Semester) => path.join(rawRoot, String(semester)),
  modulesDir: (semester: Semester) => path.join(rawRoot, String(semester), 'modules'),
};

// Output paths are the actual output from the
const outputPaths = {
  root: yearRoot,
  // List of ModuleCondensed for searching
  moduleList: path.join(yearRoot, 'moduleList.json'),
  // List of partial module info for module finder
  moduleInformation: path.join(yearRoot, 'moduleInformation.json'),
  // Get the output directory for the given semester
  semesterDir: (semester: Semester) => path.join(yearRoot, String(semester)),
  // Get the output directory for modules for a semester
  modulesDir: (semester: Semester) => path.join(yearRoot, String(semester), 'modules'),
};

/**
 * Ensures directory required for output exists
 */
export function initialize() {
  const directories = [
    outputPaths.root,
    rawPaths.root,

    ...Semesters.map(rawPaths.semesterDir),
    ...Semesters.map(rawPaths.modulesDir),
    ...Semesters.map(outputPaths.semesterDir),
    ...Semesters.map(outputPaths.modulesDir),
  ];

  directories.forEach((directory) => fs.ensureDirSync(directory));
}

export async function saveRawDepartments(departments: AcademicOrg[]) {
  return fs.writeJSON(rawPaths.departments, departments);
}

export async function saveRawFaculties(faculties: AcademicGroup[]) {
  return fs.writeJSON(rawPaths.faculties, faculties);
}
