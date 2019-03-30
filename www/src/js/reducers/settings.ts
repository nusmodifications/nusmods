import { uniq, without } from 'lodash';
import produce from 'immer';
import { REHYDRATE } from 'redux-persist';

import { FSA } from 'types/redux';
import { SettingsState } from 'types/reducers';

import {
  DISMISS_CORS_NOTIFICATION,
  ENABLE_CORS_NOTIFICATION,
  SELECT_FACULTY,
  SELECT_MODE,
  SELECT_NEW_STUDENT,
  SET_LOAD_DISQUS_MANUALLY,
  SET_MODULE_TABLE_SORT,
  TOGGLE_BETA_TESTING_STATUS,
  TOGGLE_CORS_NOTIFICATION_GLOBALLY,
  TOGGLE_MODE,
} from 'actions/settings';
import { SET_EXPORTED_DATA } from 'actions/constants';
import { DIMENSIONS, withTracker } from 'bootstrapping/matomo';
import { DARK_MODE, LIGHT_MODE } from 'types/settings';
import config from 'config';

export const defaultCorsNotificationState = {
  semesterKey: config.getSemesterKey(),
  dismissed: [],
  enabled: true,
};

const defaultSettingsState: SettingsState = {
  newStudent: false,
  faculty: '',
  mode: LIGHT_MODE,
  hiddenInTimetable: [],
  corsNotification: defaultCorsNotificationState,
  moduleTableOrder: 'exam',
  beta: false,
  loadDisqusManually: false,
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
      };
    case TOGGLE_MODE:
      return {
        ...state,
        mode: state.mode === LIGHT_MODE ? DARK_MODE : LIGHT_MODE,
      };

    case TOGGLE_CORS_NOTIFICATION_GLOBALLY:
      return produce(state, (draft) => {
        draft.corsNotification.enabled = action.payload.enabled;
      });

    case DISMISS_CORS_NOTIFICATION:
      return produce(state, (draft) => {
        const rounds: string[] = draft.corsNotification.dismissed;
        draft.corsNotification.dismissed = uniq([...rounds, action.payload.round]);
      });

    case ENABLE_CORS_NOTIFICATION:
      return produce(state, (draft) => {
        const rounds: string[] = draft.corsNotification.dismissed;
        draft.corsNotification.dismissed = without(rounds, action.payload.round);
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

    case SET_LOAD_DISQUS_MANUALLY:
      return {
        ...state,
        loadDisqusManually: action.payload,
      };

    case REHYDRATE: {
      let nextState = state;

      // Rehydrating from store - check that the key is the same, and if not,
      // reset to default state since the old dismissed notification settings is stale
      if (nextState.corsNotification.semesterKey !== config.getSemesterKey()) {
        nextState = produce(nextState, (draft) => {
          draft.corsNotification.semesterKey = config.getSemesterKey();
          draft.corsNotification.dismissed = [];
        });
      }
      return nextState;
    }

    default:
      return state;
  }
}

export default settings;
