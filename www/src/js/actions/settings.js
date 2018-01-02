// @flow
import type { FSA } from 'types/redux';
import type { Faculty, ModuleCode, Semester } from 'types/modules';
import type { Mode } from 'types/settings';

export const SELECT_SEMESTER: string = 'SELECT_SEMESTER';
export function selectSemester(semester: Semester): FSA {
  return {
    type: SELECT_SEMESTER,
    payload: semester,
  };
}

export const SELECT_NEW_STUDENT: string = 'SELECT_NEW_STUDENT';
export function selectNewStudent(newStudent: boolean): FSA {
  return {
    type: SELECT_NEW_STUDENT,
    payload: newStudent,
  };
}

export const SELECT_FACULTY: string = 'SELECT_FACULTY';
export function selectFaculty(faculty: Faculty): FSA {
  return {
    type: SELECT_FACULTY,
    payload: faculty,
  };
}

export const SELECT_MODE: string = 'SELECT_MODE';
export function selectMode(mode: Mode): FSA {
  return {
    type: SELECT_MODE,
    payload: mode,
  };
}

export const TOGGLE_MODE: string = 'TOGGLE_MODE';
export function toggleMode(): FSA {
  return {
    type: TOGGLE_MODE,
    payload: null,
  };
}

export const HIDE_LESSON_IN_TIMETABLE: string = 'HIDE_LESSON_IN_TIMETABLE';
export function hideLessonsInTimetable(moduleCode: ModuleCode): FSA {
  return {
    type: HIDE_LESSON_IN_TIMETABLE,
    payload: moduleCode,
  };
}

export const SHOW_LESSON_IN_TIMETABLE: string = 'SHOW_LESSON_IN_TIMETABLE';
export function showLessonsInTimetable(moduleCode: ModuleCode): FSA {
  return {
    type: SHOW_LESSON_IN_TIMETABLE,
    payload: moduleCode,
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
