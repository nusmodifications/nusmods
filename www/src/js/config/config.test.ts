// @flow
import _ from 'lodash';
import { roundEnd } from 'utils/cors';
import academicCalendar from 'data/academic-calendar.json';
import config from './index';
import { Semesters } from '../types/modules';

function isSorted(arr: Array<*>) {
  return arr.slice(1).every((item, index) => item >= arr[index]);
}

test('Academic calendar should have start dates for the current academic year', () => {
  expect(academicCalendar[config.academicYear]).toBeDefined();
});

test('CORS schedule is sorted', () => {
  expect(isSorted(config.corsSchedule.map(roundEnd))).toBe(true);
  config.corsSchedule.forEach((round) => {
    expect(isSorted(round.periods.map((period) => period.endDate))).toBe(true);
  });
});

test('getSemesterKey() should be unique for every acad year / semester', () => {
  const keys = new Set();

  _.range(0, 40).forEach((offset) => {
    const year = 2010 + offset;
    config.academicYear = `${year}/${year + 1}`;

    Semesters.forEach((semester) => {
      config.semester = semester;

      expect(keys.has(config.getSemesterKey())).toBe(false);
      keys.add(config.getSemesterKey());
    });
  });
});
