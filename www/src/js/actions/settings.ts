import { FSA } from 'types/redux';
import { Faculty, Semester } from 'types/modulesBase';
import { Mode } from 'types/settings';
import { ModuleTableOrder } from 'types/views';

export const SELECT_SEMESTER = 'SELECT_SEMESTER';
export function selectSemester(semester: Semester): FSA {
  return {
    type: SELECT_SEMESTER,
    payload: semester,
  };
}

export const SELECT_NEW_STUDENT = 'SELECT_NEW_STUDENT';
export function selectNewStudent(newStudent: boolean): FSA {
  return {
    type: SELECT_NEW_STUDENT,
    payload: newStudent,
  };
}

export const SELECT_FACULTY = 'SELECT_FACULTY';
export function selectFaculty(faculty: Faculty): FSA {
  return {
    type: SELECT_FACULTY,
    payload: faculty,
  };
}

export const SELECT_MODE = 'SELECT_MODE';
export function selectMode(mode: Mode): FSA {
  return {
    type: SELECT_MODE,
    payload: mode,
  };
}

export const TOGGLE_MODE = 'TOGGLE_MODE';
export function toggleMode(): FSA {
  return {
    type: TOGGLE_MODE,
    payload: null,
  };
}

export const DISMISS_CORS_NOTIFICATION = 'DISMISS_CORS_NOTIFICATION';
export function dismissCorsNotification(round: string): FSA {
  return {
    type: DISMISS_CORS_NOTIFICATION,
    payload: { round },
  };
}

export const ENABLE_CORS_NOTIFICATION = 'ENABLE_CORS_NOTIFICATION';
export function enableCorsNotification(round: string): FSA {
  return {
    type: ENABLE_CORS_NOTIFICATION,
    payload: { round },
  };
}

export const TOGGLE_CORS_NOTIFICATION_GLOBALLY = 'TOGGLE_CORS_NOTIFICATION_GLOBALLY';
export function toggleCorsNotificationGlobally(enabled: boolean): FSA {
  return {
    type: TOGGLE_CORS_NOTIFICATION_GLOBALLY,
    payload: { enabled },
  };
}

export const SET_MODULE_TABLE_SORT = 'SET_MODULE_TABLE_SORT';
export function setModuleTableOrder(sort: ModuleTableOrder): FSA {
  return {
    type: SET_MODULE_TABLE_SORT,
    payload: sort,
  };
}

export const TOGGLE_BETA_TESTING_STATUS = 'TOGGLE_BETA_TESTING_STATUS';
export function toggleBetaTesting(): FSA {
  return {
    type: TOGGLE_BETA_TESTING_STATUS,
    payload: null,
  };
}

export const SET_LOAD_DISQUS_MANUALLY = 'SET_DISQUS_MANUAL_LOAD';
export function setLoadDisqusManually(status: boolean): FSA {
  return {
    type: SET_LOAD_DISQUS_MANUALLY,
    payload: status,
  };
}
