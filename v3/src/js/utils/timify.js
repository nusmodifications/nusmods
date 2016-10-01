// @flow

import type { DayText, LessonTime, RawLesson } from 'types/modules';

// Converts a 24-hour format time string to an index.
// Each index corresponds to one cell of each timetable row.
// Each row may not start from index 0, it depends on the config's starting time.
// 0000 -> 0, 0030 -> 1, 0100 -> 2, ...
export function convertTimeToIndex(time: LessonTime): number {
  const hour: number = parseInt(time.substring(0, 2), 10);
  const minute: string = time.substring(2);
  /* eslint-disable quote-props */
  return (hour * 2) + { '00': 0, '30': 1, '59': 2 }[minute];
}

// Reverse of convertTimeToIndex.
// 0 -> 0000, 1 -> 0030, 2 -> 0100, ...
export function convertIndexToTime(index: number): LessonTime {
  const hour: number = parseInt(index / 2, 10);
  const minute: string = (index % 2) === 0 ? '00' : '30';
  return (hour < 10 ? `0${hour}` : hour.toString()) + minute;
}

export const SCHOOLDAYS: Array<DayText> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DEFAULT_EARLIEST_TIME: LessonTime = '1000';
export const DEFAULT_LATEST_TIME: LessonTime = '1800';

// Given an array of lessons, we calculate the earliest and latest timings based on the lesson timings.
// This bounds will then be used to decide the starting and ending hours of the timetable.
export function calculateBorderTimings(lessons: Array<RawLesson>): { startingIndex: number, endingIndex: number } {
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
