// @flow
import type { FSA } from 'types/redux';
import type { SettingsState } from 'types/reducers';

import * as actions from 'actions/settings';
import reducer from 'reducers/settings';
import { LIGHT_MODE, DARK_MODE } from 'types/settings';
import { initAction, rehydrateAction } from 'test-utils/redux';
import config from 'config/__mocks__/config';

const initialState: SettingsState = {
  newStudent: false,
  faculty: '',
  mode: LIGHT_MODE,
  hiddenInTimetable: [],
  corsNotification: {
    enabled: true,
    semesterKey: config.getSemesterKey(),
    dismissed: [],
  },
  moduleTableOrder: 'exam',
  beta: false,
  osEnabled: false,
};
const settingsWithNewStudent: SettingsState = { ...initialState, newStudent: true };
const faculty = 'School of Computing';
const settingsWithFaculty: SettingsState = { ...initialState, faculty };
const settingsWithDarkMode: SettingsState = { ...initialState, mode: DARK_MODE };
const settingsWithDismissedNotifications: SettingsState = {
  ...initialState,
  corsNotification: {
    ...initialState.corsNotification,
    dismissed: ['0', '1A'],
  },
};

describe('settings', () => {
  test('settings should return initial state', () => {
    const nextState: SettingsState = reducer(undefined, initAction());
    expect(nextState).toEqual(initialState);
  });

  test('can select new student', () => {
    const action: FSA = actions.selectNewStudent(true);
    const nextState: SettingsState = reducer(initialState, action);
    expect(nextState).toEqual(settingsWithNewStudent);
  });

  test('can select faculty', () => {
    const action: FSA = actions.selectFaculty(faculty);
    const nextState: SettingsState = reducer(initialState, action);
    expect(nextState).toEqual(settingsWithFaculty);
  });

  test('can select mode', () => {
    const action: FSA = actions.selectMode(DARK_MODE);
    const nextState: SettingsState = reducer(initialState, action);
    expect(nextState).toEqual(settingsWithDarkMode);

    const action2: FSA = actions.selectMode(LIGHT_MODE);
    const nextState2: SettingsState = reducer(nextState, action2);
    expect(nextState2).toEqual(initialState);
  });

  test('can toggle mode', () => {
    const action: FSA = actions.toggleMode();
    const nextState: SettingsState = reducer(initialState, action);
    expect(nextState).toEqual(settingsWithDarkMode);

    const nextState2: SettingsState = reducer(nextState, action);
    expect(nextState2).toEqual(initialState);
  });
});

describe('corsNotification settings', () => {
  test('clear out dismissed notifications when semester changes', () => {
    config.getSemesterKey = () => '2017/2018 Semester 2';

    const nextState: SettingsState = reducer(settingsWithDismissedNotifications, rehydrateAction());
    expect(nextState.corsNotification).toMatchObject({
      semesterKey: '2017/2018 Semester 2',
      dismissed: [],
      enabled: true,
    });
  });

  test('not clear disabled when semester changes', () => {
    config.getSemesterKey = () => '2017/2018 Semester 2';
    const settingsState: SettingsState = {
      ...initialState,
      corsNotification: {
        ...initialState.corsNotification,
        enabled: false,
      },
    };

    const nextState: SettingsState = reducer(settingsState, rehydrateAction());
    expect(nextState.corsNotification).toHaveProperty('enabled', false);
  });

  test('dismiss CORS notification', () => {
    const state1 = reducer(initialState, actions.dismissCorsNotification('1A'));
    expect(state1.corsNotification.dismissed).toEqual(['1A']);

    const state2 = reducer(state1, actions.dismissCorsNotification('1B'));
    expect(state2.corsNotification.dismissed).toEqual(['1A', '1B']);

    const state3 = reducer(state2, actions.dismissCorsNotification('1B'));
    expect(state3.corsNotification.dismissed).toEqual(['1A', '1B']);
  });

  test('toggle CORS notification globally', () => {
    const state1 = reducer(initialState, actions.toggleCorsNotificationGlobally(true));
    expect(state1.corsNotification.enabled).toEqual(true);

    const state2 = reducer(initialState, actions.toggleCorsNotificationGlobally(false));
    expect(state2.corsNotification.enabled).toEqual(false);
  });

  test('set module table order', () => {
    const state1 = reducer(initialState, actions.setModuleTableOrder('mc'));
    expect(state1.moduleTableOrder).toEqual('mc');

    const state2 = reducer(initialState, actions.setModuleTableOrder('code'));
    expect(state2.moduleTableOrder).toEqual('code');
  });
});

describe('beta testing state', () => {
  test('toggle should enable when beta prop does not exist', () => {
    const { beta, ...initialWithoutBeta } = initialState;
    // $FlowFixMe Flow doesn't think this is sound, for some reason
    const state = reducer(initialWithoutBeta, actions.toggleBetaTesting());
    expect(state.beta).toEqual(true);
  });

  test('toggle should enable when beta prop is false', () => {
    const state = reducer(initialState, actions.toggleBetaTesting());
    expect(state.beta).toEqual(true);
  });

  test('toggle should disable when beta prop is true', () => {
    const state = {
      ...initialState,
      beta: true,
    };

    const nextState = reducer(state, actions.toggleBetaTesting());
    expect(nextState.beta).toEqual(false);
  });
});
