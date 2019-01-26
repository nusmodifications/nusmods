// @flow

import api from '../components/api';
import {
  saveRawDepartments,
  saveRawFaculties,
  saveRawModules,
  saveRawExams,
  saveRawSemesterModuleData,
  saveTimetable,
  saveSemesterData,
} from '../components/output';

/**
 * Base task class. Dependencies and components are instance properties
 * which can be overridden in tests with mocks.
 */
export default class BaseTask {
  // For accessing the remote class and module API. By default use
  // the global singleton API instance
  api = api;

  // For storing data to the file system
  fs = {
    // Save raw data
    saveRawDepartments,
    saveRawFaculties,
    saveRawModules,
    saveRawExams,
    saveRawSemesterModuleData,

    // Save output
    saveTimetable,
    saveSemesterData,
  };
}
