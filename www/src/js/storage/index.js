// @flow
import { isString } from 'lodash';
import Raven from 'raven-js';
import { LEGACY_REDUX_KEY, PERSIST_MIGRATION_KEY } from './keys';
import migrateLegacyStorage from './migrateLegacyStorage';
import getLocalStorage from './localStorage';

// Simple wrapper around localStorage to automagically parse and stringify payloads.
function setItem(key: string, value: any) {
  try {
    getLocalStorage().setItem(key, isString(value) ? value : JSON.stringify(value));
  } catch (e) {
    // Calculate used size and attach it to the error report. This is diagnostics
    // for https://sentry.io/nusmods/v3/issues/432778991/
    const usedSpace: Object = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        let item;
        if (typeof k === 'string') item = localStorage.getItem(k);
        if (item) usedSpace[k] = Math.round(item.length / 1024);
      }
    } catch (error) {
      // Ignore error
    }

    Raven.captureException(e, {
      extra: {
        usedSpace,
      },
    });
  }
}

function getItem(key: string): any {
  let value;
  try {
    value = getLocalStorage().getItem(key);
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
    getLocalStorage().removeItem(key);
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
