import { DayText, LessonTime } from 'types/modules';
import {
  format,
  getHours,
  getISODay,
  getMinutes,
  getSeconds,
  parseISO,
  setHours,
  setMinutes,
  setSeconds,
  startOfDay,
} from 'date-fns';
import { TimePeriod } from 'types/venues';
import { Lesson } from 'types/timetables';

const SGT_OFFSET = -8 * 60;

export function getLessonTimeHours(time: LessonTime): number {
  return parseInt(time.substring(0, 2), 10);
}

export function getLessonTimeMinutes(time: LessonTime): number {
  return parseInt(time.substring(2), 10);
}

// Converts a 24-hour format time string to an index.
// Each index corresponds to one cell of each timetable row.
// Each row may not start from index 0, it depends on the config's starting time.
// 0000 -> 0, 0030 -> 1, 0100 -> 2, ...
export function convertTimeToIndex(time: LessonTime): number {
  const hour = getLessonTimeHours(time);
  const minute = getLessonTimeMinutes(time);

  // TODO: Expose incorrect offsets to user via UI
  // Currently we round up in half hour blocks, but the actual time is not shown
  let minuteOffset;
  if (minute === 0) {
    minuteOffset = 0;
  } else if (minute <= 30) {
    minuteOffset = 1;
  } else {
    minuteOffset = 2;
  }

  return hour * 2 + minuteOffset;
}

// Reverse of convertTimeToIndex.
// 0 -> 0000, 1 -> 0030, 2 -> 0100, ... , 48 -> 2400
export function convertIndexToTime(index: number): LessonTime {
  const timeIndex = Math.min(index, 48);
  const hour: number = Math.floor(timeIndex / 2);
  const minute: string = timeIndex % 2 === 0 ? '00' : '30';
  return (hour < 10 ? `0${hour}` : hour.toString()) + minute;
}

export function formatHour(hour: number): string {
  if (hour === 12) return '12 noon';
  if (hour === 0 || hour === 24) return '12 midnight';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

export function getTimeAsDate(time: string | number, date: Date = new Date()): Date {
  const dateNumber = typeof time === 'string' ? parseInt(time, 10) : time;
  return setHours(setMinutes(startOfDay(date), dateNumber % 100), Math.floor(dateNumber / 100));
}

export function formatTime(time: string | number): string {
  const timeNumber = typeof time === 'string' ? parseInt(time, 10) : time;

  if (timeNumber === 0) return '12 midnight';
  if (timeNumber === 1200) return '12 noon';

  return format(getTimeAsDate(timeNumber), 'h:mm a').toLowerCase();
}

// Create a new date object with time from the second date object
export function setTime(date: Date, time: Date): Date {
  return setHours(setMinutes(setSeconds(date, getSeconds(time)), getMinutes(time)), getHours(time));
}

export const SCHOOLDAYS: DayText[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
export const DEFAULT_EARLIEST_TIME: LessonTime = '1000';
export const DEFAULT_LATEST_TIME: LessonTime = '1800';

// Given an array of lessons, we calculate the earliest and latest timings based on the lesson timings.
// This bounds will then be used to decide the starting and ending hours of the timetable.
export function calculateBorderTimings(
  lessons: Lesson[],
  period?: TimePeriod,
): { startingIndex: number; endingIndex: number } {
  let earliestTime: number = convertTimeToIndex(DEFAULT_EARLIEST_TIME);
  let latestTime: number = convertTimeToIndex(DEFAULT_LATEST_TIME);
  lessons.forEach((lesson) => {
    earliestTime = Math.min(earliestTime, convertTimeToIndex(lesson.startTime));
    latestTime = Math.max(latestTime, convertTimeToIndex(lesson.endTime));
  });

  // Consider time range of period, if applicable
  if (period != null) {
    earliestTime = Math.min(earliestTime, convertTimeToIndex(period.startTime));
    latestTime = Math.max(latestTime, convertTimeToIndex(period.endTime));
  }

  return {
    startingIndex: earliestTime % 2 === 0 ? earliestTime : earliestTime - 1, // floor to earliest hour.
    endingIndex: latestTime % 2 === 0 ? latestTime : latestTime + 1, // ceil to latest hour.
  };
}

/**
 * Gets the current time in hours, 0915 -> 9, 1315 -> 13
 * @deprecated Use date injected by withTimer instead
 */
export function getCurrentHours(
  now: Date = new Date(), // Used for tests only
): number {
  return now.getHours();
}

/**
 * Gets the current time in hours, 0915 -> 15, 1345 -> 45
 * Current time to always match Singapore's
 *
 * @deprecated Use date injected by withTimer instead
 */
export function getCurrentMinutes(
  now: Date = new Date(), // Used for tests only
): number {
  return now.getMinutes();
}

// Monday = 0, Friday = 4, Sunday = 6
export function getDayIndex(date: Date = new Date()): number {
  return getISODay(date) - 1;
}

/**
 * Return a copy of the original Date incremented by the given number of days
 *
 * @deprecated Use addDays from date-fns
 */
export function daysAfter(startDate: Date, days: number): Date {
  const d = new Date(startDate.valueOf());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/**
 * Converts a Date object representing an event happening in Singapore time
 * and outputs a new Date object with the local time in SGT. This is useful
 * in conjunction with format from date-fns since it always use local time when
 * formatting output.
 *
 * @example
 *     // Exam is at 9AM 23rd of October 2016
 *     const examDate = new Date('2016-11-23T01:00:00.000Z');
 *     format(examDate, 'dd-MM-yyyy p');
 *     // => "23-11-2016 9:00 AM", no matter where the user machine's TZ is
 */
export function toSingaporeTime(date: string | number | Date): Date {
  const localDate = new Date(date);
  return new Date(localDate.getTime() + (localDate.getTimezoneOffset() - SGT_OFFSET) * 60 * 1000);
}

/**
 * Convert an ISO date string, eg. 2018-10-12 to a Date object with the
 * given date and time set to midnight SGT (UTC+8)
 */
export function parseDate(string: string): Date {
  return parseISO(`${string}T00:00+0800`);
}
