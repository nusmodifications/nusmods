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

  async run() {
    // Download department and faculties in parallel
    const [departments, faculties] = await Promise.all([
      this.api.getDepartment(),
      this.api.getFaculty(),
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
