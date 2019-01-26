// @flow

import BaseTask from './BaseTask';
import type { AcademicGroup, AcademicOrg } from '../types/api';
import type { Task } from '../types/tasks';

type Output = {|
  +departments: AcademicOrg[],
  +faculties: AcademicGroup[],
|};

/**
 * Downloads faculty and department data
 */
export default class GetFacultyDepartment extends BaseTask implements Task<void, Output> {
  name = 'Get faculties and departments';

  logger = this.rootLogger.child({
    task: GetFacultyDepartment.name,
  });

  async getDepartments() {
    try {
      return this.api.getDepartment();
    } catch (e) {
      this.logger.error(e, 'Cannot get department codes');
      throw e;
    }
  }

  async getFaculties() {
    try {
      return this.api.getFaculty();
    } catch (e) {
      this.logger.error(e, 'Cannot get faculty codes');
      throw e;
    }
  }

  async run() {
    this.logger.info('Downloading faculty and department codes');

    // Download department and faculties in parallel
    const [departments, faculties] = await Promise.all([
      this.getDepartments(),
      this.getFaculties(),
    ]);

    // Cache results on disk
    await Promise.all([
      this.fs.saveRawDepartments(departments),
      this.fs.saveRawFaculties(faculties),
    ]);

    // Return data for next task in pipeline
    return {
      departments,
      faculties,
    };
  }
}
