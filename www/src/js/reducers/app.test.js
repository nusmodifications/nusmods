// @flow

import { modifyLesson, changeLesson, cancelModifyLesson } from 'actions/timetables';
import { setOnlineStatus } from 'actions/app';
import { selectSemester } from 'actions/settings';

import reducer from 'reducers/app';

import type { Lesson, Semester } from 'types/modules';
import type { FSA } from 'types/redux';
import type { AppState } from 'types/reducers';
import { initAction } from 'test-utils/redux';
import lessons from '__mocks__/lessons-array.json';

const semester: Semester = 1;
const anotherSemester: Semester = 2;
const lesson: Lesson = lessons[0];
const appInitialState: AppState = {
  activeSemester: semester,
  activeLesson: null,
  isOnline: true,
  isFeedbackModalOpen: false,
  notification: null,
};
const appHasSemesterTwoState: AppState = { ...appInitialState, activeSemester: anotherSemester };
const appHasActiveLessonState: AppState = { ...appInitialState, activeLesson: lesson };

test('app should return initial state', () => {
  const nextState: AppState = reducer(undefined, initAction());

  expect(nextState).toEqual(appInitialState);
});

// Tests for active semester.
test('app should set active semester', () => {
  const action: FSA = selectSemester(anotherSemester);
  const nextState: AppState = reducer(appInitialState, action);

  expect(nextState).toEqual(appHasSemesterTwoState);
});

// Tests for active lesson.
test('app should instantiate active lesson', () => {
  const action: FSA = modifyLesson(lesson);
  const nextState: AppState = reducer(appInitialState, action);

  expect(nextState).toEqual(appHasActiveLessonState);
});

test('app should set active lesson', () => {
  const anotherLesson: Lesson = lessons[1];
  const action: FSA = modifyLesson(anotherLesson);
  const nextState: AppState = reducer(appHasActiveLessonState, action);

  expect(nextState).toEqual({ ...appInitialState, activeLesson: anotherLesson });
});

test('app should accept lesson change and unset active lesson', () => {
  const action: FSA = changeLesson(semester, lesson);
  const nextState: AppState = reducer(appInitialState, action);

  expect(nextState).toEqual(appInitialState);
});

test('app should cancel and unset active lesson', () => {
  const nextState: AppState = reducer(appHasActiveLessonState, cancelModifyLesson());

  expect(nextState).toEqual(appInitialState);
});

test('app should subscribe to online status action', () => {
  const nextState = reducer(appInitialState, setOnlineStatus(false));
  expect(nextState).toHaveProperty('isOnline', false);
  expect(reducer(nextState, setOnlineStatus(true))).toHaveProperty('isOnline', true);
});
