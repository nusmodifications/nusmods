// @flow
import { isString } from 'lodash';
import Raven from 'raven-js';
import { LEGACY_REDUX_KEY, PERSIST_MIGRATION_KEY } from './keys';
import migrateLegacyStorage from './migrateLegacyStorage';

// Shim localStorage if it doesn't exist
// Adapted from https://gist.github.com/juliocesar/926500
let usableLocalStorage; // DO NOT USE. May be undefined. Use getLocalStorage() below.
function getLocalStorage() {
  // If we've performed all our checks before, just assume results will be the same
  // Key assumption: writability of localStorage doesn't change while page is loaded
  if (usableLocalStorage) return usableLocalStorage;

  try {
    // Ensure that accessing localStorage doesn't throw
    // Next line throws on Chrome with cookies disabled
    const storage = window.localStorage;

    // Ensure that localStorage isn't null
    // Resolves https://sentry.io/share/issue/d65da46a7e19406aaee298fb89a635d6/
    if (!storage) throw new Error();

    // Ensure that if setItem throws, it's not because of private browsing
    // If storage is empty AND setItem throws, we're probably in iOS <=10 private browsing
    if (storage.length === 0) {
      storage.setItem('____writetest', 1);
      storage.removeItem('____writetest');
    }

    // Only set storage AFTER we know it can be used
    usableLocalStorage = storage;
  } catch (e) {
    // Shim if we can't use localStorage
    // Once set, don't override
    if (!usableLocalStorage) {
      usableLocalStorage = {
        privData: {},
        clear: () => {
          usableLocalStorage.privData = {};
        },
        setItem: (id, val) => {
          usableLocalStorage.privData[id] = val;
        },
        getItem: (id) => usableLocalStorage.privData[id],
        removeItem: (id) => delete usableLocalStorage.privData[id],
      };
    }
  }
  return usableLocalStorage;
}

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
