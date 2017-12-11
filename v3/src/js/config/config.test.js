// @flow
import { roundEnd } from 'utils/cors';
import config from './index';
import academicCalendar from 'data/academic-calendar.json';

function isSorted(arr: Array<*>) {
  return arr.slice(1).every((item, index) => item >= arr[index]);
}

test('Academic calendar should have start dates for the current academic year', () => {
  expect(academicCalendar[config.academicYear]).toBeDefined();
});

test('CORS schedule is sorted', () => {
  expect(isSorted(config.corsSchedule.map(roundEnd))).toBe(true);
  config.corsSchedule.forEach((round) => {
    expect(isSorted(round.periods.map(period => period.endDate))).toBe(true);
  });
});
