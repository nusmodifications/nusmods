// @flow

import api from '../utils/api';

/**
 * Base task class. Dependencies and components are instance properties
 * which can be overridden in tests with mocks.
 */
export default class BaseTask {
  // By default use global singleton API instance
  api = api;

  // TODO: Logging, error handling, fs output

  // eslint-disable-next-line class-methods-use-this
  async run(): Promise<void> {
    // Placeholder for subclass to override
    return Promise.reject(new Error('Tasks should override run()'));
  }
}
