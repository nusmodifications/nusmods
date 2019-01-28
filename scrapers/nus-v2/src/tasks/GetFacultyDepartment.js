// @flow
import { fromPairs } from 'lodash';

import type { DepartmentCodeMap, FacultyCodeMap } from '../types/mapper';
import type { AcademicGroup, AcademicOrg } from '../types/api';
import type { Task } from '../types/tasks';
import BaseTask from './BaseTask';
import { cacheDownload } from '../utils/api';
import { getCache } from '../services/output';

/**
 * Create a mapping of faculty code to faculty name from a list of faculties
 */
export const getFacultyCodeMap = (faculties: AcademicGroup[]): FacultyCodeMap =>
  fromPairs(faculties.map((faculty) => [faculty.AcademicGroup, faculty.Description]));

/**
 * Create a mapping of department code to department name from a list of faculties
 */
export const getDepartmentCodeMap = (departments: AcademicOrg[]): DepartmentCodeMap =>
  fromPairs(
    departments.map((department) => [department.AcademicOrganisation, department.Description]),
  );

/**
 * Map department to their faculties. This is useful for the frontend
 */
export function mapFacultyDepartments(
  faculties: AcademicGroup[],
  departments: AcademicOrg[],
): { [string]: string[] } {
  // Get a mapping of faculty code -> name
  const facultyCodes = {};
  const mappings = {};
  faculties.forEach((faculty) => {
    facultyCodes[faculty.AcademicGroup] = faculty.Description;
    mappings[faculty.Description] = [];
  });

  // Then add each department to their faculty
  departments.forEach((department) => {
    // The department code's first three characters is its faculty code
    const faculty = facultyCodes[department.AcademicOrganisation.slice(0, 3)];

    if (mappings[faculty]) {
      mappings[faculty].push(department.Description);
    }
  });

  return mappings;
}

type Output = {|
  +departments: AcademicOrg[],
  +faculties: AcademicGroup[],
|};

// Exported so that the CLI can use these caches
export const departmentCache = getCache<AcademicOrg[]>('departments');
export const facultyCache = getCache<AcademicGroup[]>('faculty');

/**
 * Downloads faculty and department codes. This is used to map to the codes that appear in
 * module information.
 *
 * Output:
 *  - facultyDepartments.json
 */
export default class GetFacultyDepartment extends BaseTask implements Task<void, Output> {
  name = 'Get faculties and departments';

  logger = this.rootLogger.child({
    task: GetFacultyDepartment.name,
  });

  departmentCache = departmentCache;
  facultyCache = facultyCache;

  async getDepartments() {
    return cacheDownload(
      'department codes',
      this.api.getDepartment,
      this.departmentCache,
      this.logger,
    );
  }

  async getFaculties() {
    return cacheDownload('faculty codes', this.api.getFaculty, this.facultyCache, this.logger);
  }

  async run() {
    this.logger.info('Downloading faculty and department codes');

    // Download department and faculties in parallel
    const [departments, faculties] = await Promise.all([
      this.getDepartments(),
      this.getFaculties(),
    ]);

    // Return data for next task in pipeline
    return {
      departments,
      faculties,
    };
  }
}
