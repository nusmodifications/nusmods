import _ from 'lodash';

// Simple wrapper around localStorage to automagically parse and stringify payloads.
// TODO: Use an in-memory storage for environments where localStorage is not present,
//       like private mode on Safari.
function setItem(key, value) {
  localStorage.setItem(key, _.isString(value) ? value : JSON.stringify(value));
}

function getItem(key) {
  const value = localStorage.getItem(key);
  try {
    return JSON.parse(value);
  } catch (err) {
    return value;
  }
}

const timetableKey = 'timetable';

const storage = {
  getTimetable: () => {
    return getItem(timetableKey) || {};
  },
  setTimetable: (timetable) => {
    setItem(timetableKey, timetable);
  },
};

export default storage;
