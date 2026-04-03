import { get, isString } from 'lodash-es';
import { captureException } from 'utils/error';
import getLocalStorage from './localStorage';
import migratePersistToRemember from 'bootstrapping/migrate-persist-to-remember';

// Simple wrapper around localStorage to automagically parse and stringify payloads.
function setItem(key: string, value: unknown) {
  try {
    getLocalStorage().setItem(key, isString(value) ? value : JSON.stringify(value));
  } catch (e) {
    // Calculate used size and attach it to the error report. This is diagnostics
    // for https://sentry.io/nusmods/v3/issues/432778991/
    const usedSpace: Record<string, number> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (typeof k === 'string') {
          const item = localStorage.getItem(k);
          if (item) usedSpace[k] = Math.round(item.length / 1024);
        }
      }
    } catch (error) {
      // Ignore error
    }

    captureException(e, { usedSpace });
  }
}

/**
 * This function is augmented with logic to migrate data from redux-persist to redux-remember\
 * Redux-remember uses the `@@remember-` prefix whereas redux-persist used the `persist:` prefix\
 * This function attempts to look for data stored by redux-remember (with the prefix `@@remember-`) and if the key does not exists, it constructs the key used by redux-persist (with the prefix `persist:`), gets and parses the value.
 * @param key used as the key in localStorage
 * @returns the value stored in `localStorage`.\
 * If no value is found and the key has redux-remember's prefix, it checks if the same key with redux-persist's prefix exists. If yes, it accesses, migrates and returns the data.\
 * Otherwise, returns null.
 */
function getItem(key: string): unknown {
  const reduxRememberValue = getLocalStorage().getItem(key);

  if (reduxRememberValue === null) {
    const rememberPrefixMatches = key.match(/(?<=@@remember-)(.*)/);
    if (!rememberPrefixMatches) return null;
    const baseKey = get(rememberPrefixMatches, 0);

    const persistValue = getLocalStorage().getItem(`persist:${baseKey}`);
    if (persistValue === null) return null;

    return migratePersistToRemember(persistValue);
  }

  try {
    return JSON.parse(reduxRememberValue);
  } catch (error) {
    captureException(error);
    return reduxRememberValue;
  }
}

function removeItem(key: string) {
  try {
    getLocalStorage().removeItem(key);
  } catch (e) {
    captureException(e);
  }
}

const storage = {
  setItem,
  getItem,
  removeItem,
};

export default storage;
