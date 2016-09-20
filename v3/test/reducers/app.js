// @flow

import test from 'ava';
import * as actions from 'actions/timetables';
import reducer from 'reducers/app';

import type { Semester, TimetableLesson } from 'types/modules';
import type { FSA } from 'types/redux';
import type { AppState } from 'types/reducers';
import lessons from '../mocks/lessons-array.json';

const semester: Semester = 1;
const lesson: TimetableLesson = lessons[0];
const appHasLessonState: AppState = { activeLesson: lesson };
const appHasNoLessonState: AppState = { activeLesson: null };

test('app should return initial state', (t) => {
  const nextState: AppState = reducer(undefined, {});

  t.deepEqual(nextState, appHasNoLessonState);
});

test('app should instantiate lesson state', (t) => {
  const action: FSA = actions.modifyLesson(lesson);
  const nextState: AppState = reducer(appHasNoLessonState, action);

  t.deepEqual(nextState, appHasLessonState);
});

test('app should switch lesson state', (t) => {
  const anotherLesson: TimetableLesson = lessons[1];
  const action: FSA = actions.modifyLesson(anotherLesson);
  const nextState: AppState = reducer(appHasLessonState, action);

  t.deepEqual(nextState, {
    activeLesson: anotherLesson,
  });
});

test('app should accept change and return initial state', (t) => {
  const action: FSA = actions.changeLesson(semester, lesson);
  const nextState: AppState = reducer(appHasNoLessonState, action);

  t.deepEqual(nextState, appHasNoLessonState);
});

test('app should accept change and stop holding lesson in state', (t) => {
  const action: FSA = actions.changeLesson(semester, lesson);
  const nextState: AppState = reducer(appHasLessonState, action);

  t.deepEqual(nextState, appHasNoLessonState);
});

test('app should cancel and stop holding lesson in state', (t) => {
  const nextState: AppState = reducer(appHasLessonState, actions.cancelModifyLesson());

  t.deepEqual(nextState, appHasNoLessonState);
});

test('app should cancel and return initial state', (t) => {
  const nextState: AppState = reducer(appHasNoLessonState, actions.cancelModifyLesson());

  t.deepEqual(nextState, appHasNoLessonState);
});
