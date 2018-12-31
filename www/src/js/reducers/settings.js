// @flow
import { uniq, without } from 'lodash';
import update from 'immutability-helper';
import { REHYDRATE } from 'redux-persist';

import type { FSA } from 'types/redux';
import type { SettingsState } from 'types/reducers';

import {
  SELECT_NEW_STUDENT,
  SELECT_FACULTY,
  SELECT_MODE,
  TOGGLE_MODE,
  TOGGLE_MODE_OS,
  DISMISS_CORS_NOTIFICATION,
  ENABLE_CORS_NOTIFICATION,
  TOGGLE_CORS_NOTIFICATION_GLOBALLY,
  SET_MODULE_TABLE_SORT,
  TOGGLE_BETA_TESTING_STATUS,
  ENABLE_OS_MODE,
} from 'actions/settings';
import { SET_EXPORTED_DATA } from 'actions/export';
import { DIMENSIONS, withTracker } from 'bootstrapping/mamoto';
import { LIGHT_MODE, DARK_MODE } from 'types/settings';
import config from 'config';

export const defaultCorsNotificationState = {
  semesterKey: config.getSemesterKey(),
  dismissed: [],
  enabled: true,
};

const defaultSettingsState: SettingsState = {
  osEnabled: false,
  newStudent: false,
  faculty: '',
  mode: LIGHT_MODE,
  hiddenInTimetable: [],
  corsNotification: defaultCorsNotificationState,
  moduleTableOrder: 'exam',
  beta: false,
};

function settings(state: SettingsState = defaultSettingsState, action: FSA): SettingsState {
  switch (action.type) {
    case SELECT_NEW_STUDENT:
      return {
        ...state,
        newStudent: action.payload,
      };
    case SELECT_FACULTY:
      return {
        ...state,
        faculty: action.payload,
      };
    case SELECT_MODE:
      return {
        ...state,
        mode: action.payload,
        osEnabled: false,
      };
    case TOGGLE_MODE:
      return {
        ...state,
        mode: state.osEnabled || state.mode === LIGHT_MODE ? DARK_MODE : LIGHT_MODE,
        osEnabled: false,
      };
    case TOGGLE_MODE_OS:
      return {
        ...state,
        mode: !state.osEnabled && state.mode === LIGHT_MODE ? action.payload : LIGHT_MODE,
        osEnabled: !state.osEnabled && state.mode === LIGHT_MODE,
      };
    case TOGGLE_CORS_NOTIFICATION_GLOBALLY:
      return update(state, {
        corsNotification: {
          enabled: { $set: action.payload.enabled },
        },
      });
    case ENABLE_OS_MODE:
      return {
        ...state,
        osEnabled: true,
        mode: action.payload,
      };
    case DISMISS_CORS_NOTIFICATION:
      return update(state, {
        corsNotification: {
          dismissed: (rounds) => uniq([...rounds, action.payload.round]),
        },
      });

    case ENABLE_CORS_NOTIFICATION:
      return update(state, {
        corsNotification: {
          dismissed: (rounds) => without(rounds, action.payload.round),
        },
      });

    case SET_EXPORTED_DATA:
      return {
        ...state,
        ...action.payload.settings,
      };

    case SET_MODULE_TABLE_SORT:
      return {
        ...state,
        moduleTableOrder: action.payload,
      };

    case TOGGLE_BETA_TESTING_STATUS: {
      const newStatus = !state.beta;
      withTracker((tracker) => tracker.setCustomDimension(DIMENSIONS.beta, newStatus));

      return {
        ...state,
        beta: newStatus,
      };
    }

    case REHYDRATE: {
      let nextState = state;

      // Rehydrating from store - check that the key is the same, and if not,
      // reset to default state since the old dismissed notification settings is stale
      if (nextState.corsNotification.semesterKey !== config.getSemesterKey()) {
        nextState = update(nextState, {
          corsNotification: {
            semesterKey: { $set: config.getSemesterKey() },
            dismissed: { $set: [] },
          },
        });
      }

      return nextState;
    }

    default:
      return state;
  }
}

export default settings;
