import { defaultAppState } from 'reducers/app';
import { defaultModuleBankState } from 'reducers/moduleBank';
import { defaultPlannerState } from 'reducers/planner';
import { defaultReduxRememberState } from 'reducers/reduxRemember';
import { defaultSettingsState } from 'reducers/settings';
import { defaultThemeState } from 'reducers/theme';
import { defaultTimetableState } from 'reducers/timetables';
import { defaultUndoHistoryState } from 'reducers/undoHistory';
import { defaultVenueBankState } from 'reducers/venueBank';
import { REMEMBER_REHYDRATED } from 'redux-remember';
import { State } from 'types/state';

export function initAction() {
  return {
    type: 'INIT' as const,
    payload: null,
  };
}

export function rehydrateAction(state: Partial<State>) {
  return {
    type: REMEMBER_REHYDRATED,
    payload: {
      moduleBank: defaultModuleBankState,
      venueBank: defaultVenueBankState,
      requests: {},
      timetables: defaultTimetableState,
      app: defaultAppState(),
      theme: defaultThemeState,
      settings: defaultSettingsState,
      planner: defaultPlannerState,
      undoHistory: defaultUndoHistoryState,
      reduxRemember: defaultReduxRememberState,
      ...state,
    },
  } as const;
}
