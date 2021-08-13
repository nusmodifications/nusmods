import { createGenericLesson } from 'test-utils/timetable';

import {
  convertTimeToIndex,
  convertIndexToTime,
  calculateBorderTimings,
  formatHour,
  daysAfter,
  formatTime,
  DEFAULT_EARLIEST_TIME,
  DEFAULT_LATEST_TIME,
  parseDate,
  getLessonTimeHours,
  getLessonTimeMinutes,
} from './timify';

describe('getLessonTimeHours', () => {
  test('calculates hours correctly', () => {
    expect(getLessonTimeHours('0059')).toBe(0);
    expect(getLessonTimeHours('0100')).toBe(1);
    expect(getLessonTimeHours('2300')).toBe(23);
  });
});

describe('getLessonTimeMinutes', () => {
  test('calculates minutes correctly', () => {
    expect(getLessonTimeMinutes('0000')).toBe(0);
    expect(getLessonTimeMinutes('0001')).toBe(1);
    expect(getLessonTimeMinutes('0059')).toBe(59);
  });
});

describe('convertTimeToIndex', () => {
  test('convert time string to index', () => {
    for (let hour = 0; hour < 24; hour += 1) {
      const doubleDigitTime: string = `0${hour % 24}`.slice(-2);
      expect(convertTimeToIndex(`${doubleDigitTime}00`)).toBe(hour * 2);
      expect(convertTimeToIndex(`${doubleDigitTime}30`)).toBe(hour * 2 + 1);
    }
  });

  test('convert non-half hour string to index', () => {
    const actual: number = convertTimeToIndex('2359');
    const expected = 48;
    expect(actual).toBe(expected);
  });

  test('convert time index to string', () => {
    for (let hour = 0; hour < 24; hour += 1) {
      const doubleDigitTime: string = `0${hour % 24}`.slice(-2);
      expect(convertIndexToTime(hour * 2)).toBe(`${doubleDigitTime}00`);
      expect(convertIndexToTime(hour * 2 + 1)).toBe(`${doubleDigitTime}30`);
    }
  });
});

describe('calculateBorderTimings()', () => {
  test('calculate default border timings correctly', () => {
    const timings = calculateBorderTimings([
      createGenericLesson('Anyday', '1100', '1230'),
      createGenericLesson('Anyday', '1330', '1400'),
      createGenericLesson('Anyday', '1300', '1500'),
    ]);
    expect(timings.startingIndex).toBe(convertTimeToIndex(DEFAULT_EARLIEST_TIME));
    expect(timings.endingIndex).toBe(convertTimeToIndex(DEFAULT_LATEST_TIME));
  });

  test('calculate border timings correctly', () => {
    const timings = calculateBorderTimings([
      createGenericLesson('Anyday', '0800', '1230'),
      createGenericLesson('Anyday', '1330', '1400'),
      createGenericLesson('Anyday', '1300', '1500'),
    ]);
    expect(timings.startingIndex).toBe(convertTimeToIndex('0800'));
    expect(timings.endingIndex).toBe(convertTimeToIndex(DEFAULT_LATEST_TIME));

    const timings2 = calculateBorderTimings([
      createGenericLesson('Anyday', '1100', '1230'),
      createGenericLesson('Anyday', '1330', '1400'),
      createGenericLesson('Anyday', '2000', '2100'),
    ]);
    expect(timings2.startingIndex).toBe(convertTimeToIndex(DEFAULT_EARLIEST_TIME));
    expect(timings2.endingIndex).toBe(convertTimeToIndex('2100'));
  });

  test('calculate non-hour border timings correctly', () => {
    const timings = calculateBorderTimings([
      createGenericLesson('Anyday', '0830', '1230'),
      createGenericLesson('Anyday', '1330', '1400'),
      createGenericLesson('Anyday', '1300', '1500'),
    ]);
    expect(timings.startingIndex).toBe(convertTimeToIndex('0800'));
    expect(timings.endingIndex).toBe(convertTimeToIndex(DEFAULT_LATEST_TIME));

    const timings2 = calculateBorderTimings([
      createGenericLesson('Anyday', '1100', '1230'),
      createGenericLesson('Anyday', '1330', '1400'),
      createGenericLesson('Anyday', '2000', '2130'),
    ]);
    expect(timings2.startingIndex).toBe(convertTimeToIndex(DEFAULT_EARLIEST_TIME));
    expect(timings2.endingIndex).toBe(convertTimeToIndex('2200'));

    const timings3 = calculateBorderTimings([
      createGenericLesson('Anyday', '0630', '1230'),
      createGenericLesson('Anyday', '1330', '1400'),
      createGenericLesson('Anyday', '2000', '2230'),
    ]);
    expect(timings3.startingIndex).toBe(convertTimeToIndex('0600'));
    expect(timings3.endingIndex).toBe(convertTimeToIndex('2300'));
  });
});

describe('formatHour()', () => {
  test('should convert hour to time strings', () => {
    expect(formatHour(0)).toBe('12 midnight');
    expect(formatHour(24)).toBe('12 midnight');
    expect(formatHour(12)).toBe('12 noon');

    expect(formatHour(1)).toBe('1am');
    expect(formatHour(11)).toBe('11am');

    expect(formatHour(13)).toBe('1pm');
    expect(formatHour(23)).toBe('11pm');
  });
});

test('daysAfter should create a date days after', () => {
  expect(daysAfter(new Date('2016-11-23T09:00+0800'), 1)).toEqual(
    new Date('2016-11-24T09:00+0800'),
  );
});

describe(formatTime, () => {
  test('should format time numbers to strings', () => {
    expect(formatTime(0)).toEqual('12 midnight');
    expect(formatTime(10)).toEqual('12:10 am');
    expect(formatTime(900)).toEqual('9:00 am');
    expect(formatTime(1100)).toEqual('11:00 am');
    expect(formatTime(1200)).toEqual('12 noon');
    expect(formatTime(1210)).toEqual('12:10 pm');
    expect(formatTime(2359)).toEqual('11:59 pm');
  });

  test('should format time strings', () => {
    expect(formatTime('0000')).toEqual('12 midnight');
    expect(formatTime('0900')).toEqual('9:00 am');
    expect(formatTime('1100')).toEqual('11:00 am');
    expect(formatTime('1200')).toEqual('12 noon');
    expect(formatTime('1210')).toEqual('12:10 pm');
    expect(formatTime('2359')).toEqual('11:59 pm');
  });
});

describe(parseDate, () => {
  test('should convert date string to local midnight Date object', () => {
    expect(parseDate('2018-09-10')).toEqual(new Date('2018-09-10T00:00+0800'));
  });
});
