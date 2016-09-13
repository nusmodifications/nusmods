import _ from 'lodash';

// Simple wrapper around localStorage to automagically parse and stringify payloads.
// TODO: Use an in-memory storage for environments where localStorage is not present,
//       like private mode on Safari.
function setItem(key, value) {
  try {
    localStorage.setItem(key, _.isString(value) ? value : JSON.stringify(value));
  } catch (err) {
    // TODO: Report errors to Sentry.
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
  } catch (err) {
    return value;
  }
}

function removeItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    // TODO: Report errors to Sentry.
  }
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
