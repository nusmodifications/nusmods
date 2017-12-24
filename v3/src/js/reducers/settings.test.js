// @flow
import type { FSA } from 'types/redux';
import type { SettingsState } from 'types/reducers';

import * as actions from 'actions/settings';
import reducer from 'reducers/settings';
import { LIGHT_MODE, DARK_MODE } from 'types/settings';

const settingsInitialState: SettingsState = {
  newStudent: false,
  faculty: '',
  mode: LIGHT_MODE,
  hiddenInTimetable: [],
  migratedTimetable: false,
};
const settingsWithNewStudent: SettingsState = { ...settingsInitialState, newStudent: true };
const faculty = 'School of Computing';
const settingsWithFaculty: SettingsState = { ...settingsInitialState, faculty };
const settingsWithMode: SettingsState = { ...settingsInitialState, mode: DARK_MODE };

describe('settings', () => {
  test('settings should return initial state', () => {
    const nextState: SettingsState = reducer(undefined, { type: 'INIT', payload: null });
    expect(nextState).toEqual(settingsInitialState);
  });

  test('can select new student', () => {
    const action: FSA = actions.selectNewStudent(true);
    const nextState: SettingsState = reducer(settingsInitialState, action);
    expect(nextState).toEqual(settingsWithNewStudent);
  });

  test('can select faculty', () => {
    const action: FSA = actions.selectFaculty(faculty);
    const nextState: SettingsState = reducer(settingsInitialState, action);
    expect(nextState).toEqual(settingsWithFaculty);
  });

  test('can select mode', () => {
    const action: FSA = actions.selectMode(DARK_MODE);
    const nextState: SettingsState = reducer(settingsInitialState, action);
    expect(nextState).toEqual(settingsWithMode);

    const action2: FSA = actions.selectMode(LIGHT_MODE);
    const nextState2: SettingsState = reducer(nextState, action2);
    expect(nextState2).toEqual(settingsInitialState);
  });
});
