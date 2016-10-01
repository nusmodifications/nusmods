// @flow

import test from 'ava';
import {
  convertTimeToIndex,
  convertIndexToTime,
  calculateBorderTimings,
  DEFAULT_EARLIEST_TIME,
  DEFAULT_LATEST_TIME,
} from 'utils/timify';
import { createGenericLesson } from './timetable';

test('convertTimeToIndex should convert time string to index', (t) => {
  for (let hour: number = 0; hour < 24; hour += 1) {
    const doubleDigitTime: string = (`0${hour % 24}`).slice(-2);
    if (convertTimeToIndex(`${doubleDigitTime}00`) !== hour * 2) {
      t.fail();
      break;
    }
    if (convertTimeToIndex(`${doubleDigitTime}30`) !== (hour * 2) + 1) {
      t.fail();
      break;
    }
  }
  t.pass();
});

test('convertTimeToIndex should convert non-half hour string to index', (t) => {
  const actual: number = convertTimeToIndex('2359');
  const expected: number = 48;
  t.is(actual, expected);
});

test('convertIndexToTime should convert time index to string', (t) => {
  for (let hour = 0; hour < 24; hour += 1) {
    const doubleDigitTime: string = (`0${hour % 24}`).slice(-2);
    if (convertIndexToTime(hour * 2) !== `${doubleDigitTime}00`) {
      t.fail();
      break;
    }
    if (convertIndexToTime((hour * 2) + 1) !== `${doubleDigitTime}30`) {
      t.fail();
      break;
    }
  }
  t.pass();
});

test('calculateBorderTimings should calculate default border timings correctly', (t) => {
  const timings = calculateBorderTimings([
    createGenericLesson('Anyday', '1100', '1230'),
    createGenericLesson('Anyday', '1330', '1400'),
    createGenericLesson('Anyday', '1300', '1500'),
  ]);
  t.is(timings.startingIndex, convertTimeToIndex(DEFAULT_EARLIEST_TIME));
  t.is(timings.endingIndex, convertTimeToIndex(DEFAULT_LATEST_TIME));
});

test('calculateBorderTimings should calculate border timings correctly', (t) => {
  const timings = calculateBorderTimings([
    createGenericLesson('Anyday', '0800', '1230'),
    createGenericLesson('Anyday', '1330', '1400'),
    createGenericLesson('Anyday', '1300', '1500'),
  ]);
  t.is(timings.startingIndex, convertTimeToIndex('0800'));
  t.is(timings.endingIndex, convertTimeToIndex(DEFAULT_LATEST_TIME));

  const timings2 = calculateBorderTimings([
    createGenericLesson('Anyday', '1100', '1230'),
    createGenericLesson('Anyday', '1330', '1400'),
    createGenericLesson('Anyday', '2000', '2100'),
  ]);
  t.is(timings2.startingIndex, convertTimeToIndex(DEFAULT_EARLIEST_TIME));
  t.is(timings2.endingIndex, convertTimeToIndex('2100'));
});

test('calculateBorderTimings should calculate non-hour border timings correctly', (t) => {
  const timings = calculateBorderTimings([
    createGenericLesson('Anyday', '0830', '1230'),
    createGenericLesson('Anyday', '1330', '1400'),
    createGenericLesson('Anyday', '1300', '1500'),
  ]);
  t.is(timings.startingIndex, convertTimeToIndex('0800'));
  t.is(timings.endingIndex, convertTimeToIndex(DEFAULT_LATEST_TIME));

  const timings2 = calculateBorderTimings([
    createGenericLesson('Anyday', '1100', '1230'),
    createGenericLesson('Anyday', '1330', '1400'),
    createGenericLesson('Anyday', '2000', '2130'),
  ]);
  t.is(timings2.startingIndex, convertTimeToIndex(DEFAULT_EARLIEST_TIME));
  t.is(timings2.endingIndex, convertTimeToIndex('2200'));

  const timings3 = calculateBorderTimings([
    createGenericLesson('Anyday', '0630', '1230'),
    createGenericLesson('Anyday', '1330', '1400'),
    createGenericLesson('Anyday', '2000', '2230'),
  ]);
  t.is(timings3.startingIndex, convertTimeToIndex('0600'));
  t.is(timings3.endingIndex, convertTimeToIndex('2300'));
});
