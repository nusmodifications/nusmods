// @flow

import * as actions from 'actions/timetables';
import * as themeActions from 'actions/theme';
import reducer from 'reducers/app';

import type { Lesson, ModuleCode, Semester } from 'types/modules';
import type { FSA } from 'types/redux';
import type { AppState } from 'types/reducers';
import lessons from '__mocks__/lessons-array.json';

const semester: Semester = 1;
const lesson: Lesson = lessons[0];
const moduleCode: ModuleCode = 'CS1010S';
const appInitialState: AppState = { activeLesson: null, activeModule: null };
const appHasActiveLessonState: AppState = { ...appInitialState, activeLesson: lesson };
const appHasActiveModuleState: AppState = { ...appInitialState, activeModule: moduleCode };

test('app should return initial state', () => {
  const nextState: AppState = reducer(undefined, { type: 'INIT', payload: null });

  expect(nextState).toEqual(appInitialState);
});

// Test for active lesson.

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

// Test for active module.

test('app should instantiate active module', () => {
  const action: FSA = themeActions.modifyModuleColor(moduleCode);
  const nextState: AppState = reducer(appInitialState, action);

  expect(nextState).toEqual(appHasActiveModuleState);
});

test('app should set active module', () => {
  const anotherModuleCode: ModuleCode = 'CS3216';
  const action: FSA = themeActions.modifyModuleColor(anotherModuleCode);
  const nextState: AppState = reducer(appInitialState, action);

  expect(nextState).toEqual({ ...appInitialState, activeModule: anotherModuleCode });
});

test('app should accept module color change and unset active module', () => {
  const action: FSA = themeActions.selectModuleColor(moduleCode, 1);
  const nextState: AppState = reducer(appHasActiveModuleState, action);

  expect(nextState).toEqual(appInitialState);
});

test('app should cancel and unset active module', () => {
  const nextState: AppState = reducer(appHasActiveModuleState,
                                      themeActions.cancelModifyModuleColor());

  expect(nextState).toEqual(appInitialState);
});
