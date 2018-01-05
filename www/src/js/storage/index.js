// @flow
import { isString, get } from 'lodash';
import Raven from 'raven-js';
import { LEGACY_REDUX_KEY, PERSIST_MIGRATION_KEY } from 'storage/keys';
import { defaultCorsNotificationState } from 'reducers/settings';

// Simple wrapper around localStorage to automagically parse and stringify payloads.
// TODO: Use an in-memory storage for environments where localStorage is not present,
//       like private mode on Safari.
function setItem(key: string, value: any) {
  try {
    localStorage.setItem(key, isString(value) ? value : JSON.stringify(value));
  } catch (e) {
    Raven.captureException(e);
  }
}

function getItem(key: string): any {
  let value;
  try {
    value = localStorage.getItem(key);
    if (value && value !== '') {
      return JSON.parse(value);
    }
    return undefined;
  } catch (e) {
    Raven.captureException(e);
    return value;
  }
}

function removeItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    Raven.captureException(e);
  }
}

const storage = {
  setItem,
  getItem,
  removeItem,
  loadState: () => {
    // Do not load state from legacy storage if we have already migrated
    // to Redux Persist
    if (getItem(PERSIST_MIGRATION_KEY)) return {};

    const state = getItem(LEGACY_REDUX_KEY) || {};

    // Convert legacy storage state into the new one
    const colors = get(state, 'theme.colors');
    if (colors) {
      state.timetables = {
        colors,
        ...state.timetables,
      };
    }

    if (state.settings && !state.settings.corsNotification) {
      state.settings.corsNotification = defaultCorsNotificationState;
    }

    return state;
  },
  stateMigrationComplete: () => {
    setItem(PERSIST_MIGRATION_KEY, true);
  },
};

export default storage;
