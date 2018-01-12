// @flow
import { isString } from 'lodash';
import Raven from 'raven-js';
import { LEGACY_REDUX_KEY, PERSIST_MIGRATION_KEY } from './keys';
import migrateLegacyStorage from './migrateLegacyStorage';

// Simple wrapper around localStorage to automagically parse and stringify payloads.
// TODO: Use an in-memory storage for environments where localStorage is not present,
//       like private mode on Safari.
function setItem(key: string, value: any) {
  try {
    localStorage.setItem(key, isString(value) ? value : JSON.stringify(value));
  } catch (e) {
    // Calculate used size and attach it to the error report. This is diagnostics
    // for https://sentry.io/nusmods/v3/issues/432778991/
    let usedSpace = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        let item;
        if (typeof k === 'string') item = localStorage.getItem(k);
        if (item) usedSpace += item.length;
      }
    } catch (error) {
      // Ignore error
    }

    Raven.captureException(e, {
      data: {
        usedSpace,
      },
    });
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

    return migrateLegacyStorage(getItem(LEGACY_REDUX_KEY));
  },
  stateMigrationComplete: () => {
    setItem(PERSIST_MIGRATION_KEY, true);
  },
};

export default storage;
