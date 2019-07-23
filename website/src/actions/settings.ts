import { FSA } from 'types/redux';
import { Faculty, Semester } from 'types/modules';
import { Mode } from 'types/settings';
import { ModuleTableOrder } from 'types/reducers';

import { RegPeriod, ScheduleType } from 'config';
import { getRoundKey } from 'selectors/modreg';

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

export const DISMISS_MODREG_NOTIFICATION = 'DISMISS_MODREG_NOTIFICATION';
export function dismissModregNotification(round: RegPeriod): FSA {
  return {
    type: DISMISS_MODREG_NOTIFICATION,
    payload: { round: getRoundKey(round) },
  };
}

export const ENABLE_MODREG_NOTIFICATION = 'ENABLE_MODREG_NOTIFICATION';
export function enableModRegNotification(round: RegPeriod): FSA {
  return {
    type: ENABLE_MODREG_NOTIFICATION,
    payload: { round: getRoundKey(round) },
  };
}

export const TOGGLE_MODREG_NOTIFICATION_GLOBALLY = 'TOGGLE_MODREG_NOTIFICATION_GLOBALLY';
export function toggleModRegNotificationGlobally(enabled: boolean): FSA {
  return {
    type: TOGGLE_MODREG_NOTIFICATION_GLOBALLY,
    payload: { enabled },
  };
}

export const SET_MODREG_SCHEDULE_TYPE = 'SET_MODREG_SCHEDULE_TYPE';
export function setModRegScheduleType(scheduleType: ScheduleType): FSA {
  return {
    type: SET_MODREG_SCHEDULE_TYPE,
    payload: scheduleType,
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
