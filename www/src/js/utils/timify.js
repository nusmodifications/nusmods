// @flow
import type { DayText, LessonTime, Lesson } from 'types/modules';

// Converts a 24-hour format time string to an index.
// Each index corresponds to one cell of each timetable row.
// Each row may not start from index 0, it depends on the config's starting time.
// 0000 -> 0, 0030 -> 1, 0100 -> 2, ...
export function convertTimeToIndex(time: LessonTime): number {
  const hour: number = parseInt(time.substring(0, 2), 10);
  const minute: string = time.substring(2);
  // eslint-disable-next-line quote-props
  return hour * 2 + { '00': 0, '30': 1, '59': 2 }[minute];
}

// Reverse of convertTimeToIndex.
// 0 -> 0000, 1 -> 0030, 2 -> 0100, ...
export function convertIndexToTime(index: number): LessonTime {
  const hour: number = parseInt(index / 2, 10);
  const minute: string = index % 2 === 0 ? '00' : '30';
  return (hour < 10 ? `0${hour}` : hour.toString()) + minute;
}

export function formatHour(hour: number): string {
  if (hour === 12) return '12 noon';
  if (hour === 0 || hour === 24) return '12 midnight';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

export const SCHOOLDAYS: Array<DayText> = [
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
  lessons: Array<Lesson>,
): { startingIndex: number, endingIndex: number } {
  let earliestTime: number = convertTimeToIndex(DEFAULT_EARLIEST_TIME);
  let latestTime: number = convertTimeToIndex(DEFAULT_LATEST_TIME);
  lessons.forEach((lesson) => {
    earliestTime = Math.min(earliestTime, convertTimeToIndex(lesson.StartTime));
    latestTime = Math.max(latestTime, convertTimeToIndex(lesson.EndTime));
  });
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

// Gets the current time in hours, 0915 -> 15, 1315 -> 45
// Current time to always match Singapore's
export function getCurrentMinutes(
  now: Date = new Date(), // Used for tests only
): number {
  return now.getMinutes();
}

// Monday = 0, Friday = 4
export function getCurrentDayIndex(
  now: Date = new Date(), // Used for tests only
): number {
  return now.getDay() - 1; // Minus 1 because JS week starts on Sunday
}
