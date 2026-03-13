import { strict as assert } from 'node:assert';

import BaseTask from './BaseTask';
import { Task } from '../types/tasks';
import { AuthError } from '../utils/errors';

export default class TestApi extends BaseTask implements Task {
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

      // oxlint-disable-next-line no-console
      console.log(
        '\nIf the line above looks like raw JSON, remember to pipe your command through "yarn bunyan", eg. "yarn dev test | yarn bunyan"',
      );
    } catch (error) {
      // oxlint-disable-next-line @nkzw/no-instanceof -- error type checking
      if (error instanceof AuthError) {
        this.logger.error(
          error,
          'Got an auth error when connecting to the API. Check your env.json file credentials (occasionally the API may also throw this even when the credentials are correct)',
        );
        // oxlint-disable-next-line @nkzw/no-instanceof -- error type checking
      } else if (error instanceof assert.AssertionError) {
        this.logger.error(
          error,
          'API did not return any data. Is the API down, or are you using the correct keys for the environment?',
        );
      } else {
        this.logger.error(
          error,
          'Unknown error. The API may be down, or the code is borked :(\n' +
            'Try running the unit tests using "yarn test" and open an issue on https://github.com/nusmodifications/nusmods',
        );
      }
    }
  }
}
