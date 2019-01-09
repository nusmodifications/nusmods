// @flow
import { isString } from 'lodash';
import { captureException } from 'utils/error';
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

    captureException(e, {
      usedSpace,
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
    captureException(e);
    return value;
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
