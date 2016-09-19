// @flow

import test from 'ava';
import { convertTimeToIndex, convertIndexToTime } from 'utils/timify';

test('convertTimeToIndex should convert time string to index', (t) => {
  for (let hour: number = 0; hour < 24; hour++) {
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
  const expected: number = 47;
  t.is(actual, expected);
});

test('convertIndexToTime should convert time index to string', (t) => {
  for (let hour = 0; hour < 24; hour++) {
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
