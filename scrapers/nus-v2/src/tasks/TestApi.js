// @flow

import BaseTask from './BaseTask';

export default class TestApi extends BaseTask {
  async run() {
    const [departments, faculties] = await Promise.all([
      this.api.getDepartment(),
      this.api.getFaculty(),
    ]);

    console.log(departments);
    console.log(faculties);
  }
}
