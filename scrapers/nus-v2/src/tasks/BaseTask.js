// @flow

import {
  getFaculty,
  getDepartment,
  getModuleInfo,
  getDepartmentModules,
  getFacultyModules,
} from '../utils/api';

export default class BaseTask {
  api = {
    getFaculty,
    getDepartment,
    getModuleInfo,
    getDepartmentModules,
    getFacultyModules,
  };

  // TODO: Logging, error handling, fs output

  async run(): Promise<void> {
    // Placeholder for subclass to override
    return Promise.reject(new Error('Tasks should override run()'));
  }
}
