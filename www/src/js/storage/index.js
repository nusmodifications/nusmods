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
    // Silence errors originating from Safari 10 in private browsing mode
    // https://bugs.webkit.org/show_bug.cgi?id=157010
    if (e.name.toLowerCase().includes('quota') && localStorage.length === 0) return;
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

    return migrateLegacyStorage(getItem(LEGACY_REDUX_KEY));
  },
  stateMigrationComplete: () => {
    setItem(PERSIST_MIGRATION_KEY, true);
  },
};

export default storage;
