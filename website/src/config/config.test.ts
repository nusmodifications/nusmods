/* eslint-disable import/first -- vi.unmock must be before imports (hoisted by Vitest) */
vi.unmock('config');

import { flatten, range } from 'lodash-es';

import { Semesters } from 'types/modules';
import academicCalendar from 'data/academic-calendar';
import { getModRegRoundKey } from 'selectors/modreg';

import { convertCPExWindow, getNextCPExAvailabilityChangeAt, isCPExAvailableAt } from './index';
import config from './index';

test('Academic calendar should have start dates for the current academic year', () => {
  expect((academicCalendar as Record<string, unknown>)[config.academicYear]).toBeDefined();
});

describe('CPEx availability', () => {
  const window = convertCPExWindow({
    start: '2026-10-20T09:00:00+08:00',
    end: '2026-10-22T17:00:00+08:00',
  });
  if (!window) throw new Error('Invalid CPEx availability test window');

  test('keeps production closed until the next confirmed window is configured', () => {
    expect(config.cpexWindow).toBeNull();
    expect(
      isCPExAvailableAt(new Date('2026-10-21T12:00:00+08:00'), config.cpexWindow, true, false),
    ).toBe(false);
    expect(
      config.modRegSchedule.Undergraduate.some(
        ({ type }) => type === 'Course Planning Exercise (CPEx)',
      ),
    ).toBe(false);
    expect(
      config.modRegSchedule.Graduate.some(({ type }) => type === 'Course Planning Exercise (CPEx)'),
    ).toBe(false);
  });

  test('opens at the start boundary and closes at the end boundary in Singapore time', () => {
    expect(isCPExAvailableAt(new Date('2026-10-20T08:59:59.999+08:00'), window, true, false)).toBe(
      false,
    );
    expect(isCPExAvailableAt(new Date('2026-10-20T09:00:00+08:00'), window, true, false)).toBe(
      true,
    );
    expect(isCPExAvailableAt(new Date('2026-10-20T09:00:00.001+08:00'), window, true, false)).toBe(
      true,
    );
    expect(isCPExAvailableAt(new Date('2026-10-22T16:59:59.999+08:00'), window, true, false)).toBe(
      true,
    );
    expect(isCPExAvailableAt(new Date('2026-10-22T17:00:00+08:00'), window, true, false)).toBe(
      false,
    );
    expect(isCPExAvailableAt(new Date('2026-10-22T17:00:00.001+08:00'), window, true, false)).toBe(
      false,
    );
  });

  test('fails closed for a missing, malformed, or reversed production window', () => {
    expect(convertCPExWindow(undefined)).toBeNull();
    expect(convertCPExWindow({ start: null, end: '2026-10-22T17:00:00+08:00' })).toBeNull();
    expect(convertCPExWindow({ start: 'not a date', end: '2026-10-22T17:00:00+08:00' })).toBeNull();
    expect(convertCPExWindow({ start: '2026-10-20T09:00:00+08:00', end: 'not a date' })).toBeNull();
    expect(
      convertCPExWindow({ start: '2026-10-20T09:00:00', end: '2026-10-22T17:00:00+08:00' }),
    ).toBeNull();
    expect(
      convertCPExWindow({
        start: '2026-02-30T09:00:00+08:00',
        end: '2026-03-02T17:00:00+08:00',
      }),
    ).toBeNull();
    expect(
      convertCPExWindow({
        start: '2026-10-22T17:00:01+08:00',
        end: '2026-10-22T17:00:00+08:00',
      }),
    ).toBeNull();
  });

  test('the emergency switch overrides an active production window; non-production remains testable', () => {
    const now = new Date('2026-10-21T12:00:00+08:00');

    expect(isCPExAvailableAt(now, window, true, true)).toBe(false);
    expect(isCPExAvailableAt(now, null, false, true)).toBe(true);
  });

  test('returns the next opening or closing transition for the UI', () => {
    const opening = new Date('2026-10-20T09:00:00+08:00');
    const closing = new Date('2026-10-22T17:00:00+08:00');

    expect(
      getNextCPExAvailabilityChangeAt(new Date('2026-10-19T12:00:00+08:00'), window, true, false),
    ).toEqual(opening);
    expect(getNextCPExAvailabilityChangeAt(opening, window, true, false)).toEqual(closing);
    expect(
      getNextCPExAvailabilityChangeAt(new Date('2026-10-23T12:00:00+08:00'), window, true, false),
    ).toBeNull();
    expect(getNextCPExAvailabilityChangeAt(closing, window, true, false)).toBeNull();
  });
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
