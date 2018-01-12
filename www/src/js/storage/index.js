// @flow
import { isString } from 'lodash';
import Raven from 'raven-js';
import { LEGACY_REDUX_KEY, PERSIST_MIGRATION_KEY } from './keys';
import migrateLegacyStorage from './migrateLegacyStorage';

// Shim localStorage if it doesn't exist
// Adapted from https://gist.github.com/juliocesar/926500
let usableLocalStorage; // DO NOT USE. May be undefined. Use getLocalStorage() below.
function getLocalStorage() {
  try {
    return window.localStorage;
  } catch (e) {
    if (!usableLocalStorage) {
      usableLocalStorage = {
        privData: {},
        clear: () => {
          window.localStorage.m_data = {};
        },
        setItem: (id, val) => {
          window.localStorage.privData[id] = val;
        },
        getItem: (id) => window.localStorage.privData[id],
        removeItem: (id) => delete window.localStorage.privData[id],
      };
    }
    return usableLocalStorage;
  }
}

// Simple wrapper around localStorage to automagically parse and stringify payloads.
function setItem(key: string, value: any) {
  try {
    getLocalStorage().setItem(key, isString(value) ? value : JSON.stringify(value));
  } catch (e) {
    Raven.captureException(e);
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
