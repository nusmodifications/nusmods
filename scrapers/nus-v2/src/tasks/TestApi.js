// @flow

import BaseTask from './BaseTask';
import type { Task } from '../types/tasks';

export default class TestApi extends BaseTask implements Task<> {
  name = 'Test task';

  async run() {
    const [departments, faculties] = await Promise.all([
      this.api.getDepartment(),
      this.api.getFaculty(),
    ]);

    console.log(departments);
    console.log(faculties);
  }
}
