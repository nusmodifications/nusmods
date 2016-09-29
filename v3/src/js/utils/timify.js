// @flow

import type { LessonTime } from 'types/modules';

// Converts a 24-hour format time string to an index.
// Each index corresponds to one cell of each timetable row.
// Each row may not start from index 0, it depends on the config's starting time.
// 0000 -> 0, 0030 -> 1, 0100 -> 2, ...
export function convertTimeToIndex(time: LessonTime): number {
  const hour: number = parseInt(time.substring(0, 2), 10);
  const minute: string = time.substring(2);

  return (hour * 2) + { '00': 0, 30: 1, 59: 2 }[minute];
}

// Reverse of convertTimeToIndex.
// 0 -> 0000, 1 -> 0030, 2 -> 0100, ...
export function convertIndexToTime(index: number): LessonTime {
  const hour: number = parseInt(index / 2, 10);
  const minute: string = (index % 2) === 0 ? '00' : '30';
  return (hour < 10 ? `0${hour}` : hour.toString()) + minute;
}
