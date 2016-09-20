// @flow
import type { FSA } from 'types/redux';
import type { ModuleCode, Semester, TimetableLesson } from 'types/modules';
// import nock from 'nock';

import test from 'ava';
import * as actions from 'actions/timetables';
import lessons from '../mocks/lessons-array.json';

// see: https://github.com/reactjs/redux/blob/master/docs/recipes/WritingTests.md#example-1
test.todo('write addModule test with nock and mockStore...');
test('addModule should create an action to add a module', (t) => {
  const moduleCode: ModuleCode = 'CS1010';
  /*
  const semester: Semester = 1;

  const expected: FSA = {
    type: actions.ADD_MODULE,
    payload: {
      semester,
      moduleCode,
    },
  };
  */
  const value: Function = actions.addModule(moduleCode);
  // TODO
  t.true(typeof value === 'function');
  // t.deepEqual(value, expected);
});

test('modifyLesson should return lesson payload', (t) => {
  const activeLesson: TimetableLesson = lessons[0];
  const expectedResult: FSA = {
    type: actions.MODIFY_LESSON,
    payload: {
      activeLesson,
    },
  };
  const resultOfAction: FSA = actions.modifyLesson(activeLesson);

  t.deepEqual(resultOfAction, expectedResult);
});

test('changeLesson should return updated information to change lesson', (t) => {
  const semester: Semester = 1;
  const lesson: TimetableLesson = lessons[1];
  const expectedResult: FSA = {
    type: actions.CHANGE_LESSON,
    payload: {
      semester,
      moduleCode: lesson.ModuleCode,
      lessonType: lesson.LessonType,
      classNo: lesson.ClassNo,
    },
  };
  const resultOfAction: FSA = actions.changeLesson(semester, lesson);

  t.deepEqual(resultOfAction, expectedResult);
});

test('cancelModifyLesson should not have payload', (t) => {
  const expectedResult: FSA = {
    type: actions.CANCEL_MODIFY_LESSON,
  };
  const resultOfAction: FSA = actions.cancelModifyLesson();

  t.deepEqual(resultOfAction, expectedResult);
});
