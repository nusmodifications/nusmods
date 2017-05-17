// @flow

import {
  convertTimeToIndex,
  convertIndexToTime,
  calculateBorderTimings,
  DEFAULT_EARLIEST_TIME,
  DEFAULT_LATEST_TIME,
} from 'utils/timify';
import { createGenericLesson } from './timetables';

test('convertTimeToIndex should convert time string to index', () => {
  for (let hour: number = 0; hour < 24; hour += 1) {
    const doubleDigitTime: string = (`0${hour % 24}`).slice(-2);
    expect(convertTimeToIndex(`${doubleDigitTime}00`)).toBe(hour * 2);
    expect(convertTimeToIndex(`${doubleDigitTime}30`)).toBe((hour * 2) + 1);
  }
});

test('convertTimeToIndex should convert non-half hour string to index', () => {
  const actual: number = convertTimeToIndex('2359');
  const expected: number = 48;
  expect(actual).toBe(expected);
});

test('convertIndexToTime should convert time index to string', () => {
  for (let hour = 0; hour < 24; hour += 1) {
    const doubleDigitTime: string = (`0${hour % 24}`).slice(-2);
    expect(convertIndexToTime(hour * 2)).toBe(`${doubleDigitTime}00`);
    expect(convertIndexToTime((hour * 2) + 1)).toBe(`${doubleDigitTime}30`);
  }
});

test('calculateBorderTimings should calculate default border timings correctly', () => {
  const timings = calculateBorderTimings([
    createGenericLesson('Anyday', '1100', '1230'),
    createGenericLesson('Anyday', '1330', '1400'),
    createGenericLesson('Anyday', '1300', '1500'),
  ]);
  expect(timings.startingIndex).toBe(convertTimeToIndex(DEFAULT_EARLIEST_TIME));
  expect(timings.endingIndex).toBe(convertTimeToIndex(DEFAULT_LATEST_TIME));
});

test('calculateBorderTimings should calculate border timings correctly', () => {
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

test('calculateBorderTimings should calculate non-hour border timings correctly', () => {
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
