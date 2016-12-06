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
function convertTimeToIndex(time) {
  return (parseInt(time.substring(0, 2), 10) * 2) + (time.substring(2) === '00' ? 0 : 1);
}

/**
 * Reverse of convertTimeToIndex - converts an index to 24-hour format time string.
 * @param {number} index - index to convert to 24-hour format time
 * @example 0 -> 0000, 1 -> 0030, 2 -> 0100, ...
 * @returns {string} time - 24-hour format time
 */
function convertIndexToTime(index) {
  const hour = parseInt(index / 2, 10);
  const minute = (index % 2) === 0 ? '00' : '30';
  return `000${hour}`.slice(-2) + minute;
}

/**
 * Returns a range of 24-hour format time string, each 30 minutes apart.
 * @param {string} startTime - 24-hour format time to start from (inclusive)
 * @param {string} endTime - 24-hour format time to end (exclusive)
 * @example getTimeRange('0900', '2400') -> ['0900', '0930', ..., '2330']
 * @returns {Array} listOfTime - 24-hour format time each 30 minutes apart.
 */
function getTimeRange(startTime, endTime) {
  const timeRange = R.range(
    convertTimeToIndex(startTime),
    convertTimeToIndex(endTime),
  );
  return timeRange.map(convertIndexToTime);
}

function getAllDays() {
  return DAYS.slice();
}

/**
 * List of all days in a school days,
 * current means Sunday is not a school day.
 */
function getSchoolDays() {
  return DAYS.slice(0, -1);
}

function getWeekdays() {
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
