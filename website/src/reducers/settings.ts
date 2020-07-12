import { isEqual } from 'lodash';
import produce from 'immer';
import { REHYDRATE, createMigrate } from 'redux-persist';

import { SettingsState } from 'types/reducers';
import { Actions } from 'types/actions';

import {
  DISMISS_MODREG_NOTIFICATION,
  ENABLE_MODREG_NOTIFICATION,
  SELECT_FACULTY,
  SELECT_MODE,
  SELECT_NEW_STUDENT,
  SET_LOAD_DISQUS_MANUALLY,
  SET_MODULE_TABLE_SORT,
  TOGGLE_BETA_TESTING_STATUS,
  TOGGLE_MODREG_NOTIFICATION_GLOBALLY,
  TOGGLE_MODE,
  SET_MODREG_SCHEDULE_TYPE,
} from 'actions/settings';
import { SET_EXPORTED_DATA } from 'actions/constants';
import { DIMENSIONS, withTracker } from 'bootstrapping/matomo';
import { DARK_MODE, LIGHT_MODE } from 'types/settings';
import config from 'config';
import { isRoundDismissed } from 'selectors/modreg';

export const defaultModRegNotificationState = {
  semesterKey: config.getSemesterKey(),
  dismissed: [],
  enabled: true,
  scheduleType: 'Undergraduate' as const,
};

const defaultSettingsState: SettingsState = {
  newStudent: false,
  faculty: '',
  mode: LIGHT_MODE,
  hiddenInTimetable: [],
  modRegNotification: defaultModRegNotificationState,
  moduleTableOrder: 'exam',
  beta: false,
  loadDisqusManually: false,
};

function settings(state: SettingsState = defaultSettingsState, action: Actions): SettingsState {
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

    case TOGGLE_MODREG_NOTIFICATION_GLOBALLY:
      return produce(state, (draft) => {
        draft.modRegNotification.enabled = action.payload.enabled;
      });

    case DISMISS_MODREG_NOTIFICATION:
      return produce(state, (draft) => {
        if (!isRoundDismissed(action.payload.round, draft.modRegNotification.dismissed)) {
          draft.modRegNotification.dismissed.push(action.payload.round);
        }
      });

    case ENABLE_MODREG_NOTIFICATION:
      return produce(state, (draft) => {
        draft.modRegNotification.dismissed = draft.modRegNotification.dismissed.filter(
          (key) => !isEqual(key, action.payload.round),
        );
      });

    case SET_MODREG_SCHEDULE_TYPE:
      return produce(state, (draft) => {
        draft.modRegNotification.scheduleType = action.payload;
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
      if (nextState.modRegNotification.semesterKey !== config.getSemesterKey()) {
        nextState = produce(nextState, (draft) => {
          draft.modRegNotification.semesterKey = config.getSemesterKey();
          draft.modRegNotification.dismissed = [];
        });
      }
      return nextState;
    }

    default:
      return state;
  }
}

export default settings;

export const persistConfig = {
  version: 1,
  migrate: createMigrate({
    // any is used because migration typing is hard
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    1: ({ corsNotification, ...state }: any) => ({
      // Rename corsNotification to modRegNotification and set the default modRegScheduleType
      modRegNotification: defaultSettingsState.modRegNotification,
      ...state,
    }),
  }),
};
