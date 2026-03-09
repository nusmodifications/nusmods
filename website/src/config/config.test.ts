/* eslint-disable import/first -- vi.unmock must be before imports (hoisted by Vitest) */
vi.unmock('config');

import { flatten, range } from 'lodash-es';

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

flatten(Object.values(config.modRegSchedule)).forEach((round) => {
  test(`${round.type} ${round.name} should end after it starts`, () => {
    expect(round.startDate.getTime()).toBeLessThan(round.endDate.getTime());
  });
});

test('getSemesterKey() should be unique for every acad year / semester', () => {
  const originalAcademicYear = config.academicYear;
  const originalSemester = config.semester;
  const keys = new Set();

  try {
    range(0, 40).forEach((offset) => {
      const year = 2010 + offset;
      config.academicYear = `${year}/${year + 1}`;

      Semesters.forEach((semester) => {
        config.semester = semester;

        expect(keys.has(config.getSemesterKey())).toBe(false);
        keys.add(config.getSemesterKey());
      });
    });
  } finally {
    config.academicYear = originalAcademicYear;
    config.semester = originalSemester;
  }
});
