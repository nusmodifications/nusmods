import { isString } from 'lodash';
import { captureException } from 'utils/error';
import getLocalStorage from './localStorage';

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

    if (e instanceof Error) {
      captureException(e, { usedSpace });
    } else {
      throw e;
    }
  }
}

function getItem(key: string): unknown {
  let value;
  try {
    value = getLocalStorage().getItem(key);
    if (value && value !== '') {
      return JSON.parse(value);
    }
    return undefined;
  } catch (e) {
    if (e instanceof Error) {
      captureException(e);
    } else {
      throw e;
    }
    return value;
  }
}

function removeItem(key: string) {
  try {
    getLocalStorage().removeItem(key);
  } catch (e) {
    if (e instanceof Error) {
      captureException(e);
    } else {
      throw e;
    }
  }
}

const storage = {
  setItem,
  getItem,
  removeItem,
};

export default storage;
