// @flow
import type { AcademicGrp, AcademicOrg } from '../types/api';
import type { Task } from '../types/tasks';
import type { Cache } from '../services/io';

import BaseTask from './BaseTask';
import { cacheDownload } from '../utils/api';

/**
 * Map department to their faculties. This is useful for the frontend
 */
export function mapFacultyDepartments(
  faculties: AcademicGrp[],
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

    if (mappings[faculty] && !mappings[faculty].includes(department.Description)) {
      mappings[faculty].push(department.Description);
    }
  });

  return mappings;
}

type Output = {|
  +departments: AcademicOrg[],
  +faculties: AcademicGrp[],
|};

// Cache these for 7 days since they change rarely
const cacheExpiry = 7 * 24 * 60;

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

  departmentCache: Cache<AcademicOrg[]>;
  facultyCache: Cache<AcademicGrp[]>;

  constructor(academicYear: string) {
    super(academicYear);

    this.departmentCache = this.getCache('departments', cacheExpiry);
    this.facultyCache = this.getCache('faculty', cacheExpiry);
  }

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

    // Save the mapping of departments to faculties
    const mappings = mapFacultyDepartments(faculties, departments);
    await this.io.facultyDepartments(mappings);

    // Return data for next task in pipeline
    return {
      departments,
      faculties,
    };
  }
}
