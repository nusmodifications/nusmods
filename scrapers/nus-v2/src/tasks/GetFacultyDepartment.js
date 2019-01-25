// @flow

import BaseTask from './BaseTask';

export default class GetFacultyDepartment extends BaseTask {
  async run() {
    this.fs.initialize();

    const [departments, faculties] = await Promise.all([
      this.api.getDepartment(),
      this.api.getFaculty(),
    ]);

    await Promise.all([
      this.fs.saveRawDepartments(departments),
      this.fs.saveRawFaculties(faculties),
    ]);
  }
}
