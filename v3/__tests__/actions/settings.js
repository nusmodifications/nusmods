// @flow
import type { FSA } from 'types/redux';
import type { Faculty, ModuleCode } from 'types/modules';

import * as actions from 'actions/settings';

test('should dispatch a select of a newStudent value', () => {
  const newStudent = false;
  const expectedResult: FSA = {
    type: actions.SELECT_NEW_STUDENT,
    payload: newStudent,
  };
  const resultOfAction: FSA = actions.selectNewStudent(newStudent);
  expect(resultOfAction).toEqual(expectedResult);
});

test('should dispatch a select of a faculty value', () => {
  const faculty: Faculty = 'Some faculty';
  const expectedResult: FSA = {
    type: actions.SELECT_FACULTY,
    payload: faculty,
  };
  const resultOfAction: FSA = actions.selectFaculty(faculty);
  expect(resultOfAction).toEqual(expectedResult);
});

test('should dispatch a module code for hiding', () => {
  const moduleCode: ModuleCode = 'CS1010';
  const expectedResult: FSA = {
    type: actions.HIDE_LESSON_IN_TIMETABLE,
    payload: moduleCode,
  };
  const resultOfAction: FSA = actions.hideLessonInTimetable(moduleCode);
  expect(resultOfAction).toEqual(expectedResult);
});

test('should dispatch a module code for showing', () => {
  const moduleCode: ModuleCode = 'CS1020';
  const expectedResult: FSA = {
    type: actions.SHOW_LESSON_IN_TIMETABLE,
    payload: moduleCode,
  };
  const resultOfAction: FSA = actions.showLessonInTimetable(moduleCode);
  expect(resultOfAction).toEqual(expectedResult);
});
