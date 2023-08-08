import { SettingsState } from 'types/reducers';
import produce from 'immer';

import * as actions from 'actions/settings';
import reducer from 'reducers/settings';
import { DARK_MODE, LIGHT_MODE } from 'types/settings';
import { initAction, rehydrateAction } from 'test-utils/redux';
import config, { RegPeriod } from 'config';

const initialState: SettingsState = {
  newStudent: false,
  faculty: '',
  mode: LIGHT_MODE,
  hiddenInTimetable: [],
  modRegNotification: {
    enabled: true,
    semesterKey: config.getSemesterKey(),
    dismissed: [],
    scheduleType: 'Undergraduate',
  },
  moduleTableOrder: 'exam',
  loadDisqusManually: false,
  beta: false,
};
const settingsWithNewStudent: SettingsState = { ...initialState, newStudent: true };
const faculty = 'School of Computing';
const settingsWithFaculty: SettingsState = { ...initialState, faculty };
const settingsWithDarkMode: SettingsState = { ...initialState, mode: DARK_MODE };
const settingsWithDismissedNotifications: SettingsState = produce(initialState, (draft) => {
  draft.modRegNotification.dismissed = [
    { type: 'Select Courses', name: '1' },
    { type: 'Add / Swap Tutorials', name: '' },
    { type: 'Select Courses', name: '2' },
  ];
});

describe('settings', () => {
  test('settings should return initial state', () => {
    const nextState: SettingsState = reducer(undefined, initAction());
    expect(nextState).toEqual(initialState);
  });

  test('can select new student', () => {
    const action = actions.selectNewStudent(true);
    const nextState: SettingsState = reducer(initialState, action);
    expect(nextState).toEqual(settingsWithNewStudent);
  });

  test('can select faculty', () => {
    const action = actions.selectFaculty(faculty);
    const nextState: SettingsState = reducer(initialState, action);
    expect(nextState).toEqual(settingsWithFaculty);
  });

  test('can select mode', () => {
    const action = actions.selectMode(DARK_MODE);
    const nextState: SettingsState = reducer(initialState, action);
    expect(nextState).toEqual(settingsWithDarkMode);

    const action2 = actions.selectMode(LIGHT_MODE);
    const nextState2: SettingsState = reducer(nextState, action2);
    expect(nextState2).toEqual(initialState);
  });

  test('can toggle mode', () => {
    const action = actions.toggleMode();
    const nextState: SettingsState = reducer(initialState, action);
    expect(nextState).toEqual(settingsWithDarkMode);

    const nextState2: SettingsState = reducer(nextState, action);
    expect(nextState2).toEqual(initialState);
  });

  test('set module table order', () => {
    const state1 = reducer(initialState, actions.setModuleTableOrder('mc'));
    expect(state1.moduleTableOrder).toEqual('mc');

    const state2 = reducer(initialState, actions.setModuleTableOrder('code'));
    expect(state2.moduleTableOrder).toEqual('code');
  });
});

describe('modRegNotification settings', () => {
  test('clear out dismissed notifications when semester changes', () => {
    config.getSemesterKey = () => '2017/2018 Semester 2';

    const nextState: SettingsState = reducer(settingsWithDismissedNotifications, rehydrateAction());
    expect(nextState.modRegNotification).toMatchObject({
      semesterKey: '2017/2018 Semester 2',
      dismissed: [],
      enabled: true,
    });
  });

  test('not clear disabled when semester changes', () => {
    config.getSemesterKey = () => '2017/2018 Semester 2';
    const settingsState: SettingsState = {
      ...initialState,
      modRegNotification: {
        ...initialState.modRegNotification,
        enabled: false,
      },
    };

    const nextState: SettingsState = reducer(settingsState, rehydrateAction());
    expect(nextState.modRegNotification).toHaveProperty('enabled', false);
  });

  test('dismiss ModReg notification', () => {
    // Dismissing round that already exists shouldn't do anything
    expect(
      reducer(
        settingsWithDismissedNotifications,
        actions.dismissModregNotification({ type: 'Select Courses', name: '1' } as RegPeriod),
      ).modRegNotification.dismissed,
    ).toEqual(settingsWithDismissedNotifications.modRegNotification.dismissed);

    expect(
      reducer(
        settingsWithDismissedNotifications,
        actions.dismissModregNotification({ type: 'Add / Swap Tutorials', name: '' } as RegPeriod),
      ).modRegNotification.dismissed,
    ).toEqual(settingsWithDismissedNotifications.modRegNotification.dismissed);

    // Only add items that are unique
    expect(
      reducer(
        settingsWithDismissedNotifications,
        actions.dismissModregNotification({ type: 'Select Courses', name: '3' } as RegPeriod),
      ).modRegNotification.dismissed,
    ).toEqual([
      { type: 'Select Courses', name: '1' },
      { type: 'Add / Swap Tutorials', name: '' },
      { type: 'Select Courses', name: '2' },
      { type: 'Select Courses', name: '3' },
    ]);
  });

  test('dismiss/enable notifications should be opposites', () => {
    expect(
      reducer(
        reducer(
          initialState,
          actions.dismissModregNotification({ type: 'Select Courses', name: '1' } as RegPeriod),
        ),
        actions.enableModRegNotification({ type: 'Select Courses', name: '1' } as RegPeriod),
      ).modRegNotification.dismissed,
    ).toEqual([]);
  });

  test('toggle ModReg notification globally', () => {
    const state1 = reducer(initialState, actions.toggleModRegNotificationGlobally(true));
    expect(state1.modRegNotification.enabled).toEqual(true);

    const state2 = reducer(initialState, actions.toggleModRegNotificationGlobally(false));
    expect(state2.modRegNotification.enabled).toEqual(false);
  });

  test('set schedule type', () => {
    expect(
      reducer(initialState, actions.setModRegScheduleType('Graduate')).modRegNotification
        .scheduleType,
    ).toEqual('Graduate');
    expect(
      reducer(initialState, actions.setModRegScheduleType('Undergraduate')).modRegNotification
        .scheduleType,
    ).toEqual('Undergraduate');
  });
});

describe('beta testing state', () => {
  test('toggle should enable when beta prop does not exist', () => {
    const { beta, ...initialWithoutBeta } = initialState;
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
