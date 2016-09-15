/* @flow */

// Converts a 24-hour format time string to an index.
// Each index corresponds to one cell of each timetable row.
// Each row may not start from index 0, it depends on the config's starting time.
// 0000 -> 0, 0030 -> 1, 0100 -> 2, ...
export function convertTimeToIndex(time:string):number {
  return (parseInt(time.substring(0, 2), 10) * 2) + (time.substring(2) === '00' ? 0 : 1);
}

// Reverse of convertTimeToIndex.
// 0 -> 0000, 1 -> 0030, 2 -> 0100, ...
export function convertIndexToTime(index:number):string {
  const hour = parseInt(index / 2, 10);
  const minute = (index % 2) === 0 ? '00' : '30';
  return (hour < 10 ? `0${hour.toString()}` : hour.toString()) + minute;
}
