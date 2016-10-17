// @flow
import type { FSA } from 'types/redux';
import type { Faculty } from 'types/modules';

import test from 'ava';
import * as actions from 'actions/settings';

test('should dispatch a select of a newStudent value', (t) => {
  const newStudent = false;
  const expectedResult: FSA = {
    type: actions.SELECT_NEW_STUDENT,
    payload: newStudent,
  };
  const resultOfAction: FSA = actions.selectNewStudent(newStudent);
  t.deepEqual(resultOfAction, expectedResult);
});

test('should dispatch a select of a faculty value', (t) => {
  const faculty: Faculty = 'Some faculty';
  const expectedResult: FSA = {
    type: actions.SELECT_FACULTY,
    payload: faculty,
  };
  const resultOfAction: FSA = actions.selectFaculty(faculty);
  t.deepEqual(resultOfAction, expectedResult);
});
