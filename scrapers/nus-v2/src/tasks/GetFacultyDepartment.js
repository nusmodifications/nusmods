// @flow

import BaseTask from './BaseTask';
import type { AcademicGroup, AcademicOrg } from '../types/api';
import type { Task } from '../types/tasks';
import { cacheDownload } from '../utils/api';
import { getCache } from "../services/output";

type Output = {|
  +departments: AcademicOrg[],
  +faculties: AcademicGroup[],
|};

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
