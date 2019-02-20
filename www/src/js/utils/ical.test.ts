// @ts-ignore
import { EventOption } from 'ical-generator';
import config from 'config';
import iCalForTimetable, {
  RECESS_WEEK,
  iCalEventForLesson,
  datesForAcademicWeeks,
  iCalEventForExam,
  calculateNumericWeek,
  getTimeHour,
  hoursAfter,
} from 'utils/ical';

import { Module, RawLesson } from 'types/modules';
import { EVEN_WEEK, EVERY_WEEK, ODD_WEEK } from 'test-utils/timetable';

import { BFS1001, CS1010S, CS3216 } from '__mocks__/modules';
import mockTimetable from '__mocks__/sem-timetable.json';

const rawLesson = (override: Partial<RawLesson> = {}): RawLesson => ({
  ClassNo: 'A1',
  DayText: 'Monday',
  EndTime: '1700',
  LessonType: 'Sectional Teaching',
  StartTime: '1400',
  Venue: 'BIZ1-0303',
  Weeks: [1, 2, 3, 4, 5, 6],
  ...override,
});

let originalHolidays: typeof config.holidays;
beforeAll(() => {
  originalHolidays = config.holidays;
  config.holidays = [new Date('2016-01-01')];
});

afterAll(() => {
  config.holidays = originalHolidays;
});

test('datesForAcademicWeeks should return correct dates', () => {
  expect(datesForAcademicWeeks(new Date('2016-08-10T10:00+0800'), 1)).toEqual(
    new Date('2016-08-10T10:00+0800'),
  );

  expect(datesForAcademicWeeks(new Date('2016-08-10T10:00+0800'), 3)).toEqual(
    new Date('2016-08-24T10:00+0800'),
  );

  // recess week
  expect(datesForAcademicWeeks(new Date('2016-08-10T10:00+0800'), RECESS_WEEK)).toEqual(
    new Date('2016-09-21T10:00+0800'),
  );

  // week 7 is after recess week, so it is 8 weeks after the start
  expect(datesForAcademicWeeks(new Date('2016-08-10T10:00+0800'), 7)).toEqual(
    new Date('2016-09-28T10:00+0800'),
  );
});

test('getTimeHour should return number of hours represented by a time string', () => {
  expect(getTimeHour('0000')).toEqual(0);
  expect(getTimeHour('1000')).toEqual(10);
  expect(getTimeHour('1200')).toEqual(12);
  expect(getTimeHour('2000')).toEqual(20);
  expect(getTimeHour('1030')).toEqual(10.5);
});

test('hoursAfter should return a date incremented by the given number of hours', () => {
  const d = new Date('2016-11-23T00:00+0800');
  expect(hoursAfter(d, 0)).toEqual(new Date('2016-11-23T00:00+0800'));
  expect(hoursAfter(d, 5)).toEqual(new Date('2016-11-23T05:00+0800'));
  expect(hoursAfter(d, 20)).toEqual(new Date('2016-11-23T20:00+0800'));
  expect(hoursAfter(d, 10.5)).toEqual(new Date('2016-11-23T10:30+0800'));
});

test('iCalEventForExam should generate event', () => {
  const actual: EventOption | null | undefined = iCalEventForExam(CS1010S, 1);
  const expected: EventOption = {
    start: new Date('2017-11-29T17:00+0800'),
    end: new Date('2017-11-29T19:00+0800'),
    summary: 'CS1010S Exam',
    description: 'Programming Methodology',
  };
  expect(actual).toEqual(expected);
});

//     August 2016            September 2016         October 2016
// Wk Mo Tu We Th Fr Sa | Wk Mo Tu We Th Fr Sa | Wk Mo Tu We Th Fr Sa
//     2  3  4  5  6    | 04        1  2  3    | 07                 1
// 01  8  9 10 11 12 13 | 05  5  6  7  8  9 10 | 08  3  4  5  6  7  8
// 02 15 16 17 18 19 20 | 06 12 13 14 15 16 17 | 09 10 11 12 13 14 15
// 03 22 23 24 25 26 27 | Re 19 20 21 22 23 24 | 10 17 18 19 20 21 22
// 04 29 30 31          | 07 26 27 28 29 30    | 11 24 25 26 27 28 29
//                      |                      | 12 31
//
//     November 2016    |
// Wk Mo Tu We Th Fr Sa |
// 12     1  2  3  4  5 |
// 13  7  8  9 10 11 12 |
// Re 14 15 16 17 18 19 |
// E1 21 22 23 24 25 26 |
// E2 28 29 30          |

describe(calculateNumericWeek, () => {
  const firstDay = new Date('2016-08-08T00:00+0800');
  function testCalculateNumericWeek(weeks: number[]) {
    return calculateNumericWeek(
      rawLesson({
        Weeks: weeks,
      }),
      1,
      weeks,
      firstDay,
    ).repeating.exclude;
  }

  test('generates exclusion for comma separated weeks', () => {
    expect(testCalculateNumericWeek([1, 2, 3, 4, 5, 6])).toEqual(
      expect.arrayContaining([
        new Date('2016-09-19T14:00+0800'), // Recess
        new Date('2016-09-26T14:00+0800'), // 7
        new Date('2016-10-03T14:00+0800'), // 8
        new Date('2016-10-10T14:00+0800'), // 9
        new Date('2016-10-17T14:00+0800'), // 10
        new Date('2016-10-24T14:00+0800'), // 11
        new Date('2016-10-31T14:00+0800'), // 12
        new Date('2016-11-07T14:00+0800'), // 13
      ]),
    );
  });

  test('generates exclusion for even weeks', () => {
    // Exclusions should be odd week lessons
    expect(testCalculateNumericWeek(EVEN_WEEK)).toEqual(
      expect.arrayContaining([
        new Date('2016-08-08T14:00+0800'), // 1
        new Date('2016-08-22T14:00+0800'), // 3
        new Date('2016-09-05T14:00+0800'), // 5
        new Date('2016-09-19T14:00+0800'), // Recess
        new Date('2016-09-26T14:00+0800'), // 7
        new Date('2016-10-10T14:00+0800'), // 9
        new Date('2016-10-24T14:00+0800'), // 11
        new Date('2016-11-07T14:00+0800'), // 13
      ]),
    );
  });

  test('generates exclusion for odd weeks', () => {
    // Exclusions should be even week lessons
    expect(testCalculateNumericWeek(ODD_WEEK)).toEqual(
      expect.arrayContaining([
        new Date('2016-08-15T14:00+0800'), // 2
        new Date('2016-08-29T14:00+0800'), // 4
        new Date('2016-09-12T14:00+0800'), // 6
        new Date('2016-09-19T14:00+0800'), // Recess
        new Date('2016-10-03T14:00+0800'), // 8
        new Date('2016-10-17T14:00+0800'), // 10
        new Date('2016-10-31T14:00+0800'), // 12
      ]),
    );
  });

  test('generates exclusions for holidays', () => {
    // 2016 holidays
    expect(testCalculateNumericWeek(EVERY_WEEK)).toEqual(
      expect.arrayContaining([new Date('2016-01-01T14:00+0800')]),
    );
  });
});

test('iCalEventForLesson generates correct output', () => {
  const actual: EventOption = iCalEventForLesson(
    {
      ClassNo: 'A1',
      DayText: 'Monday',
      EndTime: '1700',
      LessonType: 'Sectional Teaching',
      StartTime: '1400',
      Venue: 'BIZ1-0303',
      Weeks: [1, 2, 3, 4, 5, 6],
    },
    BFS1001 as Module,
    1,
    new Date('2016-08-08T00:00+0800'),
  );

  const expected = {
    start: new Date('2016-08-08T14:00+0800'),
    end: new Date('2016-08-08T17:00+0800'),
    summary: 'BFS1001 Sectional Teaching',
    description: 'Personal Development & Career Management\nSectional Teaching Group A1',
    location: 'BIZ1-0303',
    repeating: {
      freq: 'WEEKLY',
      count: 14,
      byDay: ['Mo'],
      exclude: expect.arrayContaining([]), // Tested in previous tests
    },
  };

  expect(actual).toEqual(expected);
});

test('work for half hour lesson offsets', () => {
  const actual: EventOption = iCalEventForLesson(
    {
      ClassNo: 'A1',
      DayText: 'Monday',
      EndTime: '2030',
      LessonType: 'Sectional Teaching',
      StartTime: '1830',
      Venue: 'BIZ1-0303',
      Weeks: EVERY_WEEK,
    },
    BFS1001 as Module,
    1,
    new Date('2016-08-08T00:00+0800'),
  );

  const expected = {
    start: new Date('2016-08-08T18:30+0800'),
    end: new Date('2016-08-08T20:30+0800'),
    summary: 'BFS1001 Sectional Teaching',
    description: 'Personal Development & Career Management\nSectional Teaching Group A1',
    location: 'BIZ1-0303',
    repeating: {
      freq: 'WEEKLY',
      count: 14,
      byDay: ['Mo'],
      exclude: expect.arrayContaining([]), // Tested in previous tests
    },
  };

  expect(actual).toEqual(expected);
});

describe(iCalForTimetable, () => {
  test('should produce the correct number of lesson', () => {
    const moduleData = {
      CS1010S,
      CS3216,
    };
    const actual = iCalForTimetable(1, mockTimetable, moduleData);
    // 5 lesson types for cs1010s, 1 for cs3216, 1 exam for cs1010s
    expect(actual.length === 7).toBe(true);
  });
});
