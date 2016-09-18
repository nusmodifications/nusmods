import test from 'ava';
import { convertTimeToIndex, convertIndexToTime } from 'utils/timify';

test('convertTimeToIndex should convert time string to index', (t) => {
  for (let hour = 0; hour < 24; hour++) {
    const doubleDigitTime = (`0${hour % 24}`).slice(-2);
    if (convertTimeToIndex(`${doubleDigitTime}00`) !== hour * 2 &
      convertTimeToIndex(`${doubleDigitTime}30`) !== (hour * 2) + 1) {
      t.fail();
      break;
    }
  }
  t.pass();
});

test('convertTimeToIndex should convert non-half hour string to index', (t) => {
  const actual = convertTimeToIndex('2359');
  const expected = 47;
  t.is(actual, expected);
});

test('convertTimeToIndex should convert non-half hour string to index', (t) => {
  const actual = convertTimeToIndex('2359');
  const expected = 47;
  t.is(actual, expected);
});

test('convertIndexToTime should convert time index to string', (t) => {
  for (let hour = 0; hour < 24; hour++) {
    const doubleDigitTime = (`0${hour % 24}`).slice(-2);
    if (convertIndexToTime(hour * 2) !== `${doubleDigitTime}00` &
      convertIndexToTime((hour * 2) + 1) !== `${doubleDigitTime}30`) {
      t.fail();
      break;
    }
  }
  t.pass();
});
