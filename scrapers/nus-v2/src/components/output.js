// @flow

import path from 'path';
import * as fs from 'fs-extra';

import type { AcademicGroup, AcademicOrg, ModuleExam } from '../types/api';
import type { ModuleCode, RawLesson, Semester, SemesterData } from '../types/modules';
import type { ModuleInfoMapped, SemesterModuleData } from '../types/mapper';
import config from '../config';

const yearRoot = path.join(config.dataPath, config.academicYear.replace('/', '-'));

// Raw paths are for caching the direct and intermediate outputs from the API
const rawRoot = path.join(yearRoot, 'raw');

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

  moduleSemesterData: (moduleCode: ModuleCode, semester: Semester) =>
    path.join(yearRoot, String(semester), 'modules', moduleCode, 'semesterData.json'),
};

export async function saveRawDepartments(departments: AcademicOrg[]) {
  const filepath = path.join(rawRoot, 'departments.json');
  return fs.outputJSON(filepath, departments);
}

export async function saveRawFaculties(faculties: AcademicGroup[]) {
  const filepath = path.join(rawRoot, 'faculties.json');
  return fs.outputJSON(filepath, faculties);
}

export async function saveRawModules(semester: Semester, modules: ModuleInfoMapped[]) {
  const filepath = path.join(rawRoot, String(semester), 'modules.json');
  return fs.outputJSON(filepath, modules);
}

export async function saveRawExams(semester: Semester, exams: ModuleExam[]) {
  const filepath = path.join(rawRoot, String(semester), 'exams.json');
  return fs.outputJSON(filepath, exams);
}

export async function saveRawSemesterModuleData(
  semester: Semester,
  moduleData: SemesterModuleData[],
) {
  const filepath = path.join(rawRoot, String(semester), 'moduleData.json');
  return fs.outputJSON(filepath, moduleData);
}

export async function saveTimetable(
  semester: Semester,
  moduleCode: ModuleCode,
  timetable: RawLesson[],
) {
  const filepath = outputPaths.timetable(moduleCode, semester);
  return fs.outputJSON(filepath, timetable);
}

export async function saveSemesterData(
  semester: Semester,
  moduleCode: ModuleCode,
  semesterData: SemesterData,
) {
  const filepath = outputPaths.moduleSemesterData(moduleCode, semester);
  return fs.outputJSON(filepath, semesterData);
}
