// @flow

import { strict as assert } from 'assert';

import BaseTask from './BaseTask';
import type { Task } from '../types/tasks';
import { AuthError } from '../services/errors';

export default class TestApi extends BaseTask implements Task<> {
  name = 'Test task';
  logger = this.rootLogger.child({ task: TestApi.name });

  async run() {
    try {
      const [departments, faculties] = await Promise.all([
        this.api.getDepartment(),
        this.api.getFaculty(),
      ]);

      assert(departments.length > 0, 'Did not get any department');
      assert(faculties.length > 0, 'Did not get any faculty');

      this.logger.info('Got information from the API! Looks like everything is working a-okay!');

      // eslint-disable-next-line no-console
      console.log(
        '\nIf the line above looks like raw JSON, remember to pipe your command through "yarn bunyan", eg. "yarn dev test | yarn bunyan"',
      );
    } catch (e) {
      if (e instanceof AuthError) {
        this.logger.error(
          e,
          'Got an auth error when connecting to the API. Check your env.json file credentials.',
        );
      } else if (e instanceof assert.AssertionError) {
        this.logger.error(
          e,
          'API did not return any data. Is the API down, or are you using the correct keys for the environment?',
        );
      } else {
        this.logger.error(
          e,
          'Unknown error. The API may be down, or the code is borked :(\n' +
            'Try running the unit tests using "yarn test" and open an issue on https://github.com/nusmodifications/nusmods',
        );
      }
    }
  }
}
