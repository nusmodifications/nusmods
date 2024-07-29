import { Faculty, Semester } from 'types/modules';
import { ColorSchemePreference } from 'types/settings';
import { ModuleTableOrder } from 'types/reducers';

import { RegPeriod, ScheduleType } from 'config';
import { getModRegRoundKey } from 'selectors/modreg';

export const SELECT_SEMESTER = 'SELECT_SEMESTER' as const;
export function selectSemester(semester: Semester) {
  return {
    type: SELECT_SEMESTER,
    payload: semester,
  };
}

export const SELECT_NEW_STUDENT = 'SELECT_NEW_STUDENT' as const;
export function selectNewStudent(newStudent: boolean) {
  return {
    type: SELECT_NEW_STUDENT,
    payload: newStudent,
  };
}

export const SELECT_FACULTY = 'SELECT_FACULTY' as const;
export function selectFaculty(faculty: Faculty) {
  return {
    type: SELECT_FACULTY,
    payload: faculty,
  };
}

export const SELECT_COLOR_SCHEME = 'SELECT_COLOR_SCHEME' as const;
export function selectColorScheme(mode: ColorSchemePreference) {
  return {
    type: SELECT_COLOR_SCHEME,
    payload: mode,
  };
}

export const DISMISS_MODREG_NOTIFICATION = 'DISMISS_MODREG_NOTIFICATION' as const;
export function dismissModregNotification(round: RegPeriod) {
  return {
    type: DISMISS_MODREG_NOTIFICATION,
    payload: { round: getModRegRoundKey(round) },
  };
}

export const ENABLE_MODREG_NOTIFICATION = 'ENABLE_MODREG_NOTIFICATION' as const;
export function enableModRegNotification(round: RegPeriod) {
  return {
    type: ENABLE_MODREG_NOTIFICATION,
    payload: { round: getModRegRoundKey(round) },
  };
}

export const TOGGLE_MODREG_NOTIFICATION_GLOBALLY = 'TOGGLE_MODREG_NOTIFICATION_GLOBALLY' as const;
export function toggleModRegNotificationGlobally(enabled: boolean) {
  return {
    type: TOGGLE_MODREG_NOTIFICATION_GLOBALLY,
    payload: { enabled },
  };
}

export const SET_MODREG_SCHEDULE_TYPE = 'SET_MODREG_SCHEDULE_TYPE' as const;
export function setModRegScheduleType(scheduleType: ScheduleType) {
  return {
    type: SET_MODREG_SCHEDULE_TYPE,
    payload: scheduleType,
  };
}

export const SET_MODULE_TABLE_SORT = 'SET_MODULE_TABLE_SORT' as const;
export function setModuleTableOrder(sort: ModuleTableOrder) {
  return {
    type: SET_MODULE_TABLE_SORT,
    payload: sort,
  };
}

export const TOGGLE_BETA_TESTING_STATUS = 'TOGGLE_BETA_TESTING_STATUS' as const;
export function toggleBetaTesting() {
  return {
    type: TOGGLE_BETA_TESTING_STATUS,
    payload: null,
  };
}

export const SET_LOAD_DISQUS_MANUALLY = 'SET_DISQUS_MANUAL_LOAD' as const;
export function setLoadDisqusManually(status: boolean) {
  return {
    type: SET_LOAD_DISQUS_MANUALLY,
    payload: status,
  };
}
