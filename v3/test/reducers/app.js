// @flow

import test from 'ava';
import * as actions from 'actions/timetables';
import * as themeActions from 'actions/theme';
import reducer from 'reducers/app';

import type { Lesson, ModuleCode, Semester } from 'types/modules';
import type { FSA } from 'types/redux';
import type { AppState } from 'types/reducers';
import lessons from '../mocks/lessons-array.json';

const semester: Semester = 1;
const lesson: Lesson = lessons[0];
const moduleCode: ModuleCode = 'CS1010S';
const appInitialState: AppState = { activeLesson: null, activeModule: null };
const appHasActiveLessonState: AppState = { ...appInitialState, activeLesson: lesson };
const appHasActiveModuleState: AppState = { ...appInitialState, activeModule: moduleCode };

test('app should return initial state', (t) => {
  const nextState: AppState = reducer(undefined, {});

  t.deepEqual(nextState, appInitialState);
});

// Test for active lesson.

test('app should instantiate active lesson', (t) => {
  const action: FSA = actions.modifyLesson(lesson);
  const nextState: AppState = reducer(appInitialState, action);

  t.deepEqual(nextState, appHasActiveLessonState);
});

test('app should set active lesson', (t) => {
  const anotherLesson: Lesson = lessons[1];
  const action: FSA = actions.modifyLesson(anotherLesson);
  const nextState: AppState = reducer(appHasActiveLessonState, action);

  t.deepEqual(nextState, { ...appInitialState, activeLesson: anotherLesson });
});

test('app should accept lesson change and unset active lesson', (t) => {
  const action: FSA = actions.changeLesson(semester, lesson);
  const nextState: AppState = reducer(appInitialState, action);

  t.deepEqual(nextState, appInitialState);
});

test('app should cancel and unset active lesson', (t) => {
  const nextState: AppState = reducer(appHasActiveLessonState, actions.cancelModifyLesson());

  t.deepEqual(nextState, appInitialState);
});

// Test for active module.

test('app should instantiate active module', (t) => {
  const action: FSA = themeActions.modifyModuleColor(moduleCode);
  const nextState: AppState = reducer(appInitialState, action);

  t.deepEqual(nextState, appHasActiveModuleState);
});

test('app should set active module', (t) => {
  const anotherModuleCode: ModuleCode = 'CS3216';
  const action: FSA = themeActions.modifyModuleColor(anotherModuleCode);
  const nextState: AppState = reducer(appInitialState, action);

  t.deepEqual(nextState, { ...appInitialState, activeModule: anotherModuleCode });
});

test('app should accept module color change and unset active module', (t) => {
  const action: FSA = themeActions.selectModuleColor(moduleCode, 1);
  const nextState: AppState = reducer(appHasActiveModuleState, action);

  t.deepEqual(nextState, appInitialState);
});

test('app should cancel and unset active module', (t) => {
  const nextState: AppState = reducer(appHasActiveModuleState,
                                      themeActions.cancelModifyModuleColor());

  t.deepEqual(nextState, appInitialState);
});
