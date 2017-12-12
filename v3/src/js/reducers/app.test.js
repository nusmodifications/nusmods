// @flow

import * as actions from 'actions/timetables';
import * as settingsActions from 'actions/settings';
import reducer from 'reducers/app';

import type { Lesson, Semester } from 'types/modules';
import type { FSA } from 'types/redux';
import type { AppState } from 'types/reducers';
import lessons from '__mocks__/lessons-array.json';

const semester: Semester = 1;
const anotherSemester: Semester = 2;
const lesson: Lesson = lessons[0];
const appInitialState: AppState = {
  activeSemester: semester,
  activeLesson: null,
};
const appHasSemesterTwoState: AppState = { ...appInitialState, activeSemester: anotherSemester };
const appHasActiveLessonState: AppState = { ...appInitialState, activeLesson: lesson };

test('app should return initial state', () => {
  const nextState: AppState = reducer(undefined, { type: 'INIT', payload: null });

  expect(nextState).toEqual(appInitialState);
});

// Tests for active semester.
test('app should set active semester', () => {
  const action: FSA = settingsActions.selectSemester(anotherSemester);
  const nextState: AppState = reducer(appInitialState, action);

  expect(nextState).toEqual(appHasSemesterTwoState);
});

// Tests for active lesson.
test('app should instantiate active lesson', () => {
  const action: FSA = actions.modifyLesson(lesson);
  const nextState: AppState = reducer(appInitialState, action);

  expect(nextState).toEqual(appHasActiveLessonState);
});

test('app should set active lesson', () => {
  const anotherLesson: Lesson = lessons[1];
  const action: FSA = actions.modifyLesson(anotherLesson);
  const nextState: AppState = reducer(appHasActiveLessonState, action);

  expect(nextState).toEqual({ ...appInitialState, activeLesson: anotherLesson });
});

test('app should accept lesson change and unset active lesson', () => {
  const action: FSA = actions.changeLesson(semester, lesson);
  const nextState: AppState = reducer(appInitialState, action);

  expect(nextState).toEqual(appInitialState);
});

test('app should cancel and unset active lesson', () => {
  const nextState: AppState = reducer(appHasActiveLessonState, actions.cancelModifyLesson());

  expect(nextState).toEqual(appInitialState);
});
