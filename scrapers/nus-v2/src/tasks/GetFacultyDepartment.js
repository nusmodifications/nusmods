// @flow

import BaseTask from './BaseTask';
import type { AcademicGroup, AcademicOrg } from '../types/api';
import type { Task } from '../types/tasks';
import { cacheDownload } from '../utils/api';

type Output = {|
  +departments: AcademicOrg[],
  +faculties: AcademicGroup[],
|};

/**
 * Downloads faculty and department codes. This is used to map to the codes that appear in
 * module information.
 */
export default class GetFacultyDepartment extends BaseTask implements Task<void, Output> {
  name = 'Get faculties and departments';

  logger = this.rootLogger.child({
    task: GetFacultyDepartment.name,
  });

  async getDepartments() {
    return cacheDownload(
      'department codes',
      this.api.getDepartment,
      this.fs.raw.departments,
      this.logger,
    );
  }

  async getFaculties() {
    return cacheDownload('faculty codes', this.api.getFaculty, this.fs.raw.faculties, this.logger);
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
