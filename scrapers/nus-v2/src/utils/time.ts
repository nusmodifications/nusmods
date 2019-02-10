import { range } from 'lodash';

/**
 * Utility function for dealing with time, specifically for the timetable
 * where we divide classes up into chunks of 30 minute blocks
 */

/**
 * Converts a 24-hour format time string to an index.
 * @param {string} time - 24-hour format time to convert to index
 * @example 0000 -> 0, 0030 -> 1, 0100 -> 2, ...
 * @returns {number} index - integer representing array index
 */
const timeIndexMap: Record<string, number> = { '00': 0, '30': 1, '59': 2 };
export function convertTimeToIndex(time: string) {
  const hour = parseInt(time.substring(0, 2), 10);
  const minute = time.substring(2);
  return hour * 2 + timeIndexMap[minute];
}

/**
 * Reverse of convertTimeToIndex - converts an index to 24-hour format time string.
 * @param {number} index - index to convert to 24-hour format time
 * @example 0 -> 0000, 1 -> 0030, 2 -> 0100, ...
 * @returns {string} time - 24-hour format time
 */
export function convertIndexToTime(index: number) {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? '00' : '30';
  return (hour < 10 ? `0${hour}` : hour.toString()) + minute;
}

/**
 * Returns a range of 24-hour format time string, each 30 minutes apart.
 * @param {string} startTime - 24-hour format time to start from (inclusive)
 * @param {string} endTime - 24-hour format time to end (exclusive)
 * @example getTimeRange('0900', '2400') -> ['0900', '0930', ..., '2330']
 * @returns {Array} listOfTime - 24-hour format time each 30 minutes apart.
 */
export function getTimeRange(startTime: string, endTime: string): string[] {
  const timeRange = range(convertTimeToIndex(startTime), convertTimeToIndex(endTime));
  return timeRange.map(convertIndexToTime);
}
