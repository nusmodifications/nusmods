import { SCHOOLDAYS } from 'utils/timify';

export type DayText = string; // E.g. "Monday", "Tuesday"
export type StartTime = string; // E.g. "1400"
export type EndTime = string; // E.g. "1500"

/**
 * Represents a time period in the timetable.
 */
export type TimePeriod = {
  Day: number; // Day of week (ie. 0 = Monday, 1 = Tuesday etc.)
  DayText: DayText;
  StartTime: StartTime;
  EndTime: EndTime;
};

/**
 * Represents a time period with a specified color in the timetable.
 */
export type ColoredTimePeriod = TimePeriod & {
  colorIndex: number;
};

/**
 * Returns a generic time period with some default parameter values, if they are not specified.
 */
export function createGenericTimePeriod(
  day: number = 0,
  startTime: StartTime = '0800',
  endTime: EndTime = '0830',
): TimePeriod {
  return {
    Day: day,
    DayText: SCHOOLDAYS[day],
    StartTime: startTime,
    EndTime: endTime,
  };
}

/**
 * Returns a generic colored time period with some default parameter values, if they are not specified.
 */
export function createGenericColoredTimePeriod(
  day?: number,
  startTime?: StartTime,
  endTime?: EndTime,
  colorIndex: number = 0,
): ColoredTimePeriod {
  return {
    ...createGenericTimePeriod(day, startTime, endTime),
    colorIndex,
  };
}
