import R from 'ramda';

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/**
 * Converts a 24-hour format time string to an index.
 * @param {string} time - 24-hour format time to convert to index
 * @example 0000 -> 0, 0030 -> 1, 0100 -> 2, ...
 * @returns {number} index - integer representing array index
 */
export function convertTimeToIndex(time) {
  const hour = parseInt(time.substring(0, 2), 10);
  const minute = time.substring(2);
  /* eslint-disable quote-props */
  return (hour * 2) + { '00': 0, '30': 1, '59': 2 }[minute];
}

/**
 * Reverse of convertTimeToIndex - converts an index to 24-hour format time string.
 * @param {number} index - index to convert to 24-hour format time
 * @example 0 -> 0000, 1 -> 0030, 2 -> 0100, ...
 * @returns {string} time - 24-hour format time
 */
export function convertIndexToTime(index) {
  const hour = parseInt(index / 2, 10);
  const minute = (index % 2) === 0 ? '00' : '30';
  return (hour < 10 ? `0${hour}` : hour.toString()) + minute;
}

/**
 * Returns a range of 24-hour format time string, each 30 minutes apart.
 * @param {string} startTime - 24-hour format time to start from (inclusive)
 * @param {string} endTime - 24-hour format time to end (exclusive)
 * @example getTimeRange('0900', '2400') -> ['0900', '0930', ..., '2330']
 * @returns {Array} listOfTime - 24-hour format time each 30 minutes apart.
 */
export function getTimeRange(startTime, endTime) {
  const timeRange = R.range(
    convertTimeToIndex(startTime),
    convertTimeToIndex(endTime),
  );
  return timeRange.map(convertIndexToTime);
}

export function getAllDays() {
  return DAYS.slice();
}

/**
 * List of all days in a school days,
 * currently means Sunday is not a school day.
 */
export function getSchoolDays() {
  return DAYS.slice(0, -1);
}

export function getWeekdays() {
  return DAYS.slice(0, -2);
}

export default {
  convertTimeToIndex,
  convertIndexToTime,
  getTimeRange,
  getAllDays,
  getSchoolDays,
  getWeekdays,
};
