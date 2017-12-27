// @flow
import { uniq, without } from 'lodash';
import update from 'immutability-helper';

import type { FSA } from 'types/redux';
import type { SettingsState } from 'types/reducers';

import {
  SELECT_NEW_STUDENT,
  SELECT_FACULTY,
  SELECT_MODE,
  TOGGLE_MODE,
  HIDE_LESSON_IN_TIMETABLE,
  SHOW_LESSON_IN_TIMETABLE,
  DISMISS_CORS_NOTIFICATION,
  ENABLE_CORS_NOTIFICATION,
  TOGGLE_CORS_NOTIFICATION_GLOBALLY,
} from 'actions/settings';
import { LIGHT_MODE, DARK_MODE } from 'types/settings';
import config from 'config';

const defaultCorsNotificationState = {
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
};

function hidden(state = [], action: FSA) {
  if (!action.payload) {
    return state;
  }
  switch (action.type) {
    case HIDE_LESSON_IN_TIMETABLE:
      return [action.payload, ...state];
    case SHOW_LESSON_IN_TIMETABLE:
      return state.filter((c) => c !== action.payload);
    default:
      return state;
  }
}

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
    case HIDE_LESSON_IN_TIMETABLE:
    case SHOW_LESSON_IN_TIMETABLE:
      return {
        ...state,
        hiddenInTimetable: hidden(state.hiddenInTimetable, action),
      };

    case TOGGLE_CORS_NOTIFICATION_GLOBALLY:
      return update(state, {
        corsNotification: {
          enabled: { $set: action.payload.enabled },
        },
      });

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

    default: {
      let nextState = state;

      if (!nextState.corsNotification) {
        nextState = update(nextState, {
          corsNotification: { $set: defaultCorsNotificationState },
        });
      }

      // Rehydrating from store - check that the key is the same, and if not,
      // return to default state since the old dismissed notification settings is stale
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
  }
}

export default settings;
