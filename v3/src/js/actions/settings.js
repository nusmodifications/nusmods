// @flow
import type { FSA } from 'types/redux';
import type { Faculty, ModuleCode, Semester } from 'types/modules';

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

// TODO: Shift this action to actions/timetables.
export const HIDE_LESSON_IN_TIMETABLE: string = 'HIDE_LESSON_IN_TIMETABLE';
export function hideLessonInTimetable(moduleCode: ModuleCode): FSA {
  return {
    type: HIDE_LESSON_IN_TIMETABLE,
    payload: moduleCode,
  };
}

// TODO: Shift this action to actions/timetables.
export const SHOW_LESSON_IN_TIMETABLE: string = 'SHOW_LESSON_IN_TIMETABLE';
export function showLessonInTimetable(moduleCode: ModuleCode): FSA {
  return {
    type: SHOW_LESSON_IN_TIMETABLE,
    payload: moduleCode,
  };
}
