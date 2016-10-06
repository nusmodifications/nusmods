// @flow
import type { FSA } from 'types/redux';
import type { Faculty } from 'types/modules';

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
