export function convertTimeToIndex(time) {
  // Converts a 24-hour format time string to an index:
  // 0000 -> 0, 0030 -> 1, 0100 -> 2, ...
  return (parseInt(time.substring(0, 2), 10) * 2) + (time.substring(2) === '00' ? 0 : 1);
}

export function convertIndexToTime(index) {
  // Reverse of convertTimeToIndex
  // 0 -> 0000, 1 -> 0030, 2 -> 0100, ...
  const hour = parseInt(index / 2, 10);
  const minute = (index % 2) === 0 ? '00' : '30';
  return (hour < 10 ? `0${hour.toString()}` : hour.toString()) + minute;
}
