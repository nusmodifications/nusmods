import _ from 'lodash';
import { Semesters } from 'types/modules';
import { roundEnd } from 'utils/cors';
import academicCalendar from 'data/academic-calendar.json';
import config from './index';

function isSorted(arr: any[]) {
  return arr.slice(1).every((item, index) => item >= arr[index]);
}

test('Academic calendar should have start dates for the current academic year', () => {
  // @ts-ignore
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
