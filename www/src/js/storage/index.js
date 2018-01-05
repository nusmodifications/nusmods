import { isString } from 'lodash';
import Raven from 'raven-js';
import { LEGACY_REDUX_KEY } from 'storage/keys';

// Simple wrapper around localStorage to automagically parse and stringify payloads.
// TODO: Use an in-memory storage for environments where localStorage is not present,
//       like private mode on Safari.
function setItem(key, value) {
  try {
    localStorage.setItem(key, isString(value) ? value : JSON.stringify(value));
  } catch (e) {
    Raven.captureException(e);
  }
}

function getItem(key) {
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

function removeItem(key) {
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
  loadState: () => getItem(LEGACY_REDUX_KEY) || {},
  saveState: (state) => {
    setItem(LEGACY_REDUX_KEY, state);
  },
};

export default storage;
