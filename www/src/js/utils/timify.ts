import { DayText, Lesson, LessonTime } from 'types/modules';
import {
  format,
  getHours,
  getISODay,
  getMinutes,
  getSeconds,
  setHours,
  setMinutes,
  setSeconds,
  startOfDay,
} from 'date-fns';
import { TimePeriod } from 'types/views';

// Converts a 24-hour format time string to an index.
// Each index corresponds to one cell of each timetable row.
// Each row may not start from index 0, it depends on the config's starting time.
// 0000 -> 0, 0030 -> 1, 0100 -> 2, ...
export function convertTimeToIndex(time: LessonTime): number {
  const hour = parseInt(time.substring(0, 2), 10);
  const minute = parseInt(time.substring(2), 10);

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
    earliestTime = Math.min(earliestTime, convertTimeToIndex(lesson.StartTime));
    latestTime = Math.max(latestTime, convertTimeToIndex(lesson.EndTime));
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

// Gets the current time in hours, 0915 -> 9, 1315 -> 13
export function getCurrentHours(
  now: Date = new Date(), // Used for tests only
): number {
  return now.getHours();
}

// Gets the current time in hours, 0915 -> 15, 1345 -> 45
// Current time to always match Singapore's
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
 */
export function daysAfter(startDate: Date, days: number): Date {
  const d = new Date(startDate.valueOf());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
