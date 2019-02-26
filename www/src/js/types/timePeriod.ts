import { EndTime, StartTime } from './modules';

/**
 * Represents a time period in the timetable.
 */
export type TimePeriod = {
  day: number; // Day of week (ie. 0 = Monday, 1 = Tuesday etc.)
  StartTime: StartTime;
  EndTime: EndTime;
};

/**
 * Returns a generic time period with some default parameter values, if they are not specified.
 */
export function createTimePeriod(
  dayIndex: number,
  startTime: StartTime,
  endTime: EndTime,
): TimePeriod {
  return {
    day: dayIndex,
    StartTime: startTime,
    EndTime: endTime,
  };
}
