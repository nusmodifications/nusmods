import _ from 'lodash';
import Raven from 'raven-js';

// Simple wrapper around localStorage to automagically parse and stringify payloads.
// TODO: Use an in-memory storage for environments where localStorage is not present,
//       like private mode on Safari.
function setItem(key, value) {
  Raven.context(() => {
    localStorage.setItem(key, _.isString(value) ? value : JSON.stringify(value));
  });
}

function getItem(key) {
  let value;
  try {
    value = localStorage.getItem(key);
    if (value && value !== '') {
      return JSON.parse(value);
    }
    return undefined;
  } catch (err) {
    Raven.captureException(err);
    return value;
  }
}

function removeItem(key) {
  Raven.context(() => {
    localStorage.removeItem(key);
  });
}

const stateKey = 'reduxState';

const storage = {
  setItem,
  getItem,
  removeItem,
  loadState: () => {
    return getItem(stateKey) || {};
  },
  saveState: (state) => {
    setItem(stateKey, state);
  },
};

export default storage;
