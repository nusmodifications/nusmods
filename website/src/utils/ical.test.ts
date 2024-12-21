import { EventOption } from 'ical-generator';
import config from 'config';
import iCalForTimetable, {
  calculateNumericWeek,
  calculateWeekRange,
  datesForAcademicWeeks,
  getTimeHour,
  iCalEventForExam,
  iCalEventForLesson,
  RECESS_WEEK,
} from 'utils/ical';

import { Module, RawLesson, WeekRange } from 'types/modules';
import { EVEN_WEEK, EVERY_WEEK, ODD_WEEK } from 'test-utils/timetable';

import { BFS1001, CS1010S, CS3216 } from '__mocks__/modules';
import mockTimetable from '__mocks__/sem-timetable.json';

const rawLesson = (override: Partial<RawLesson> = {}): RawLesson => ({
  classNo: 'A1',
  day: 'Monday',
  endTime: '1700',
  lessonType: 'Sectional Teaching',
  startTime: '1400',
  venue: 'BIZ1-0303',
  weeks: [1, 2, 3, 4, 5, 6],
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

describe(iCalEventForExam, () => {
  test('should generate event', () => {
    const expected: EventOption = {
      start: new Date('2017-11-29T17:00+0800'),
      end: new Date('2017-11-29T19:00+0800'),
      summary: 'CS1010S Exam',
      description: 'Programming Methodology',
    };

    expect(iCalEventForExam(CS1010S, 1)).toEqual(expected);
  });

  test('should take into account examDuration', () => {
    const module: Module = {
      moduleCode: 'CS1010S',
      title: 'Programming Methodology',
      semesterData: [
        {
          semester: 1,
          examDate: '2017-11-29T17:00+0800',
          examDuration: 90,
        },
      ],
    } as any;

    const expected: EventOption = {
      start: new Date('2017-11-29T17:00+0800'),
      end: new Date('2017-11-29T18:30+0800'),
      summary: 'CS1010S Exam',
      description: 'Programming Methodology',
    };

    expect(iCalEventForExam(module, 1)).toEqual(expected);
  });
});

//     August 2016            September 2016         October 2016
// Wk Mo Tu We Th Fr Sa | Wk Mo Tu We Th Fr Sa | Wk Mo Tu We Th Fr Sa
//     1  2  3  4  5  6 | 04        1  2  3    | 07                 1
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
  const testCalculateNumericWeek = (weeks: number[]) =>
    calculateNumericWeek(
      rawLesson({
        weeks,
      }),
      1,
      weeks,
      firstDay,
    ).repeating!.exclude;

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

describe(calculateWeekRange, () => {
  const testCalculateWeekRange = (weekRange: WeekRange) =>
    calculateWeekRange(
      rawLesson({
        weeks: weekRange,
      }),
      1,
      weekRange,
    ).repeating!;

  test('generate correct until date', () => {
    const { until } = testCalculateWeekRange({
      start: '2016-08-01', // Orientation
      end: '2016-11-28', // Exam week 2
    });

    expect(until).toEqual(new Date('2016-11-28T17:00+0800'));
  });

  test('generate correct interval for week intervals', () => {
    const { interval, until } = testCalculateWeekRange({
      start: '2016-08-01', // Orientation
      end: '2016-11-28', // Exam week 2
      weekInterval: 2,
    });

    expect(interval).toEqual(2);

    expect(until).toEqual(new Date('2016-11-28T17:00+0800'));
  });

  test('generate correct exclusion for irregular weeks', () => {
    const { interval, exclude } = testCalculateWeekRange({
      start: '2016-08-01', // Orientation
      end: '2016-11-28', // Exam week 2
      weekInterval: 2,
      // Exclude 7th week from orientation = week 6
      //        11th week from orientation = week 9 (including recess week)
      weeks: [1, 3, 5, 9, 13, 15],
    });

    expect(exclude).toEqual(
      expect.arrayContaining([
        new Date('2016-09-12T14:00+0800'),
        new Date('2016-10-10T14:00+0800'),
      ]),
    );
    expect(interval).toEqual(2);
  });
});

test('iCalEventForLesson generates correct output', () => {
  const actual: EventOption = iCalEventForLesson(
    {
      classNo: 'A1',
      day: 'Monday',
      endTime: '1700',
      lessonType: 'Sectional Teaching',
      startTime: '1400',
      venue: 'BIZ1-0303',
      weeks: [1, 2, 3, 4, 5, 6],
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
      classNo: 'A1',
      day: 'Monday',
      endTime: '2030',
      lessonType: 'Sectional Teaching',
      startTime: '1830',
      venue: 'BIZ1-0303',
      weeks: EVERY_WEEK,
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
    const actual = iCalForTimetable(1, mockTimetable, moduleData, [], {});
    // 5 lesson types for cs1010s, 1 for cs3216, 1 exam for cs1010s
    expect(actual).toHaveLength(7);
  });

  test('should produce the correct number of lesson after excluding hidden mod', () => {
    const moduleData = {
      CS1010S,
      CS3216,
    };
    const actual = iCalForTimetable(1, mockTimetable, moduleData, ['CS3216'], {});
    // 5 lesson types for cs1010s, 1 exam for cs1010s (1 lesson for cs3216 will be exluded)
    expect(actual).toHaveLength(6);
  });

  test('should produce the correct number of lesson after excluding TA mod', () => {
    const moduleData = {
      CS1010S,
      CS3216,
    };
    const actual = iCalForTimetable(1, mockTimetable, moduleData, [], { CS1010S: ['Tutorial'] });
    // 2 lesson types for cs1010s, 1 for cs3216 (1 lecture, 2 recitations and 1 exam for cs1010s will be excluded)
    expect(actual).toHaveLength(3);
  });
});
