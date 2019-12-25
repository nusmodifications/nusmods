import _ from 'lodash';

import { Semesters } from 'types/modules';
import academicCalendar from 'data/academic-calendar.json';
import { getModRegRoundKey } from 'selectors/modreg';

import config from './index';

test('Academic calendar should have start dates for the current academic year', () => {
  expect((academicCalendar as Record<string, unknown>)[config.academicYear]).toBeDefined();
});

test('Every ModReg round has unique keys', () => {
  Object.values(config.modRegSchedule).forEach((rounds) => {
    const keys = rounds.map(getModRegRoundKey);
    expect(keys).toEqual(Array.from(new Set(keys)));
  });
});

_.flatten(Object.values(config.modRegSchedule)).forEach((round) => {
  test(`${round.type} ${round.name} should end after it starts`, () => {
    expect(round.startDate.getTime()).toBeLessThan(round.endDate.getTime());
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
