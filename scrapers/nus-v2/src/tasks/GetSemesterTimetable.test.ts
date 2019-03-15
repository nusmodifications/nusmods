import CS4238Timetable from './fixtures/api-timetable/CS4238.json';
import MA2213Timetable from './fixtures/api-timetable/MA2213.json';
import CS2100Timetable from './fixtures/api-timetable/CS2100_2.json';
import CN4205ETimetable from './fixtures/api-timetable/CN4205E.json';
import CS1010XTimetable from './fixtures/api-timetable/CS1010X.json';
import RE5001Timetable from './fixtures/api-timetable/RE5001.json';

import GetSemesterTimetable from './GetSemesterTimetable';
import { EVERY_WEEK, expectLessonsEqual } from '../utils/test-utils';
import { TimetableLesson } from '../types/api';
import { Semester } from '../types/modules';

describe(GetSemesterTimetable, () => {
  function createTask(lessons: TimetableLesson[], semester: Semester = 1) {
    const task = new GetSemesterTimetable(semester, '2018/2019');

    task.api.getSemesterTimetables = jest.fn((term, consumer) => {
      lessons.forEach((lesson) => consumer(lesson));
      return Promise.resolve();
    });

    return task;
  }

  test('should map empty timetable lessons', async () => {
    const task = createTask([]);
    await expect(task.run()).resolves.toEqual({});
  });

  // This module has classes on recess and reading week for some reason
  test('should map CN4205E timetable lessons correctly', async () => {
    const task = createTask(CN4205ETimetable);
    const timetable = await task.run();

    expect(timetable.CN4205E).toMatchInlineSnapshot(`
Array [
  Object {
    "classNo": "1",
    "day": "Wednesday",
    "endTime": "2030",
    "lessonType": "Lecture",
    "startTime": "1800",
    "venue": "E5-03-23",
    "weeks": Object {
      "end": "2018-11-21",
      "start": "2018-08-15",
    },
  },
  Object {
    "classNo": "1",
    "day": "Wednesday",
    "endTime": "2130",
    "lessonType": "Tutorial",
    "startTime": "2030",
    "venue": "E5-03-23",
    "weeks": Object {
      "end": "2018-11-21",
      "start": "2018-08-15",
    },
  },
]
`);
  });

  // CS4238 is relatively simple - two lesson types, four lessons, every week
  test('should map CS4238 timetable lessons correctly', async () => {
    const task = createTask(CS4238Timetable);
    const timetable = await task.run();

    expectLessonsEqual(timetable.CS4238, [
      {
        classNo: '1',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '2030',
        endTime: '2130',
        venue: 'COM1-B113',
      },
      {
        classNo: '2',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Tuesday',
        startTime: '2030',
        endTime: '2130',
        venue: 'COM1-B113',
      },
      {
        classNo: '1',
        lessonType: 'Lecture',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '1830',
        endTime: '2030',
        venue: 'COM1-B113',
      },
      {
        classNo: '2',
        lessonType: 'Lecture',
        weeks: EVERY_WEEK,
        day: 'Tuesday',
        startTime: '1830',
        endTime: '2030',
        venue: 'COM1-B113',
      },
    ]);
  });

  // MA2213 is more complicated, with some alternating lessons for lab and tutorials
  test('should map MA2213 timetable lessons correctly', async () => {
    const task = createTask(MA2213Timetable);
    const timetable = await task.run();
    expectLessonsEqual(timetable.MA2213, [
      {
        classNo: '1',
        lessonType: 'Laboratory',
        weeks: [3, 5, 7, 9, 11],
        day: 'Tuesday',
        startTime: '1100',
        endTime: '1200',
        venue: 'S17-0304',
      },
      {
        classNo: '2',
        lessonType: 'Laboratory',
        weeks: [3, 5, 7, 9, 11],
        day: 'Monday',
        startTime: '1700',
        endTime: '1800',
        venue: 'S17-0304',
      },
      {
        classNo: '3',
        lessonType: 'Laboratory',
        weeks: [3, 5, 7, 9, 11],
        day: 'Tuesday',
        startTime: '1600',
        endTime: '1700',
        venue: 'S17-0304',
      },
      {
        classNo: '4',
        lessonType: 'Laboratory',
        weeks: [3, 5, 7, 9, 11],
        day: 'Wednesday',
        startTime: '1400',
        endTime: '1500',
        venue: 'S17-0304',
      },
      {
        classNo: '1',
        lessonType: 'Lecture',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '0800',
        endTime: '1000',
        venue: 'LT34',
      },
      {
        classNo: '1',
        lessonType: 'Lecture',
        weeks: EVERY_WEEK,
        day: 'Wednesday',
        startTime: '1000',
        endTime: '1200',
        venue: 'LT33',
      },
      {
        classNo: '1',
        lessonType: 'Tutorial',
        weeks: [4, 6, 8, 10, 12],
        day: 'Tuesday',
        startTime: '1100',
        endTime: '1200',
        venue: 'S17-0404',
      },
      {
        classNo: '2',
        lessonType: 'Tutorial',
        weeks: [4, 6, 8, 10, 12],
        day: 'Monday',
        startTime: '1700',
        endTime: '1800',
        venue: 'S17-0404',
      },
      {
        classNo: '3',
        lessonType: 'Tutorial',
        weeks: [4, 6, 8, 10, 12],
        day: 'Tuesday',
        startTime: '1600',
        endTime: '1700',
        venue: 'S17-0611',
      },
      {
        classNo: '4',
        lessonType: 'Tutorial',
        weeks: [4, 6, 8, 10, 12],
        day: 'Wednesday',
        startTime: '1400',
        endTime: '1500',
        venue: 'S17-0404',
      },
    ]);
  });

  // CS2100 has a lot of lessons, and two joined lecture groups
  test('should map CS2100 timetable lessons correctly', async () => {
    const task = createTask(CS2100Timetable, 2);
    const timetable = await task.run();

    expectLessonsEqual(timetable.CS2100, [
      {
        classNo: '01',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '0800',
        endTime: '0900',
        venue: 'COM1-0113',
      },
      {
        classNo: '02',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '0900',
        endTime: '1000',
        venue: 'COM1-0113',
      },
      {
        classNo: '03',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '1000',
        endTime: '1100',
        venue: 'COM1-0113',
      },
      {
        classNo: '04',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '1100',
        endTime: '1200',
        venue: 'COM1-0113',
      },
      {
        classNo: '05',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '1200',
        endTime: '1300',
        venue: 'COM1-0113',
      },
      {
        classNo: '06',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '1300',
        endTime: '1400',
        venue: 'COM1-0113',
      },
      {
        classNo: '07',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '1400',
        endTime: '1500',
        venue: 'COM1-0113',
      },
      {
        classNo: '08',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '1500',
        endTime: '1600',
        venue: 'COM1-0113',
      },
      {
        classNo: '09',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '1600',
        endTime: '1700',
        venue: 'COM1-0113',
      },
      {
        classNo: '10',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '1700',
        endTime: '1800',
        venue: 'COM1-0113',
      },
      {
        classNo: '11',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Thursday',
        startTime: '0800',
        endTime: '0900',
        venue: 'COM1-0113',
      },
      {
        classNo: '12',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Thursday',
        startTime: '0900',
        endTime: '1000',
        venue: 'COM1-0113',
      },
      {
        classNo: '13',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Thursday',
        startTime: '1000',
        endTime: '1100',
        venue: 'COM1-0113',
      },
      {
        classNo: '14',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Thursday',
        startTime: '1100',
        endTime: '1200',
        venue: 'COM1-0113',
      },
      {
        classNo: '15',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Thursday',
        startTime: '1200',
        endTime: '1300',
        venue: 'COM1-0113',
      },
      {
        classNo: '16',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Thursday',
        startTime: '1300',
        endTime: '1400',
        venue: 'COM1-0113',
      },
      {
        classNo: '17',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Thursday',
        startTime: '1400',
        endTime: '1500',
        venue: 'COM1-0113',
      },
      {
        classNo: '18',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Thursday',
        startTime: '1500',
        endTime: '1600',
        venue: 'COM1-0113',
      },
      {
        classNo: '19',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Thursday',
        startTime: '1600',
        endTime: '1700',
        venue: 'COM1-0113',
      },
      {
        classNo: '20',
        lessonType: 'Laboratory',
        weeks: EVERY_WEEK,
        day: 'Thursday',
        startTime: '1700',
        endTime: '1800',
        venue: 'COM1-0113',
      },
      {
        classNo: '1',
        lessonType: 'Lecture',
        weeks: EVERY_WEEK,
        day: 'Tuesday',
        startTime: '1600',
        endTime: '1800',
        venue: 'I3-AUD',
      },
      {
        classNo: '1',
        lessonType: 'Lecture',
        weeks: EVERY_WEEK,
        day: 'Wednesday',
        startTime: '1400',
        endTime: '1500',
        venue: 'I3-AUD',
      },
      {
        classNo: '2',
        lessonType: 'Lecture',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '1000',
        endTime: '1200',
        venue: 'I3-AUD',
      },
      {
        classNo: '2',
        lessonType: 'Lecture',
        weeks: EVERY_WEEK,
        day: 'Wednesday',
        startTime: '1500',
        endTime: '1600',
        venue: 'I3-AUD',
      },
      {
        classNo: '01',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Wednesday',
        startTime: '1100',
        endTime: '1200',
        venue: 'COM1-0207',
      },
      {
        classNo: '02',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Friday',
        startTime: '0900',
        endTime: '1000',
        venue: 'COM1-0209',
      },
      {
        classNo: '03',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Tuesday',
        startTime: '1000',
        endTime: '1100',
        venue: 'COM1-0207',
      },
      {
        classNo: '04',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Wednesday',
        startTime: '1100',
        endTime: '1200',
        venue: 'COM1-0201',
      },
      {
        classNo: '05',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Friday',
        startTime: '1100',
        endTime: '1200',
        venue: 'COM1-0209',
      },
      {
        classNo: '06',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Friday',
        startTime: '1200',
        endTime: '1300',
        venue: 'COM1-0209',
      },
      {
        classNo: '07',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Tuesday',
        startTime: '1300',
        endTime: '1400',
        venue: 'COM1-0209',
      },
      {
        classNo: '08',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '1200',
        endTime: '1300',
        venue: 'COM1-0207',
      },
      {
        classNo: '09',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '1600',
        endTime: '1700',
        venue: 'COM1-0203',
      },
      {
        classNo: '10',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Tuesday',
        startTime: '0900',
        endTime: '1000',
        venue: 'COM1-0201',
      },
      {
        classNo: '11',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '1500',
        endTime: '1600',
        venue: 'COM1-0203',
      },
      {
        classNo: '12',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Thursday',
        startTime: '1700',
        endTime: '1800',
        venue: 'COM1-0207',
      },
      {
        classNo: '13',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Wednesday',
        startTime: '1000',
        endTime: '1100',
        venue: 'COM1-0207',
      },
      {
        classNo: '14',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Tuesday',
        startTime: '1100',
        endTime: '1200',
        venue: 'COM1-0209',
      },
      {
        classNo: '15',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Friday',
        startTime: '0800',
        endTime: '0900',
        venue: 'COM1-0209',
      },
      {
        classNo: '16',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Wednesday',
        startTime: '1200',
        endTime: '1300',
        venue: 'COM1-0209',
      },
      {
        classNo: '17',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Wednesday',
        startTime: '1300',
        endTime: '1400',
        venue: 'COM1-0209',
      },
      {
        classNo: '18',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Friday',
        startTime: '1300',
        endTime: '1400',
        venue: 'COM1-0209',
      },
      {
        classNo: '19',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Friday',
        startTime: '1400',
        endTime: '1500',
        venue: 'COM1-0209',
      },
      {
        classNo: '20',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Friday',
        startTime: '1500',
        endTime: '1600',
        venue: 'COM1-0209',
      },
    ]);
  });

  // CS1010X has lessons extending outside the normal semester week range
  test('should map CS1010X timetable lessons correctly', async () => {
    const task = createTask(CS1010XTimetable as TimetableLesson[]);
    const output = await task.run();

    expect(output).toMatchInlineSnapshot(`
Object {
  "CS1010X": Array [
    Object {
      "classNo": "1",
      "day": "Thursday",
      "endTime": "1000",
      "lessonType": "Recitation",
      "startTime": "0900",
      "venue": "SR_LT19",
      "weeks": Object {
        "end": "2019-06-20",
        "start": "2019-01-17",
      },
    },
    Object {
      "classNo": "2",
      "day": "Thursday",
      "endTime": "1300",
      "lessonType": "Recitation",
      "startTime": "1200",
      "venue": "SR_LT19",
      "weeks": Object {
        "end": "2019-06-20",
        "start": "2019-01-17",
      },
    },
    Object {
      "classNo": "01",
      "day": "Thursday",
      "endTime": "1100",
      "lessonType": "Tutorial",
      "startTime": "1000",
      "venue": "SR_LT19",
      "weeks": Object {
        "end": "2019-06-20",
        "start": "2019-01-17",
      },
    },
    Object {
      "classNo": "02",
      "day": "Thursday",
      "endTime": "1200",
      "lessonType": "Tutorial",
      "startTime": "1100",
      "venue": "SR_LT19",
      "weeks": Object {
        "end": "2019-06-20",
        "start": "2019-01-17",
      },
    },
    Object {
      "classNo": "03",
      "day": "Thursday",
      "endTime": "1400",
      "lessonType": "Tutorial",
      "startTime": "1300",
      "venue": "SR_LT19",
      "weeks": Object {
        "end": "2019-06-20",
        "start": "2019-01-17",
      },
    },
    Object {
      "classNo": "04",
      "day": "Thursday",
      "endTime": "1500",
      "lessonType": "Tutorial",
      "startTime": "1400",
      "venue": "SR_LT19",
      "weeks": Object {
        "end": "2019-06-20",
        "start": "2019-01-17",
      },
    },
  ],
}
`);
  });

  // RE5001 has lessons with only one session outside of the normal semester weeks
  // Tests for accidentally introducing infinity when calculating weekInterval
  test('should map RE5001 timetable lessons correctly', async () => {
    const task = createTask(RE5001Timetable);
    const output = await task.run();

    expect(output).toMatchInlineSnapshot(`
Object {
  "RE5001": Array [
    Object {
      "classNo": "1",
      "day": "Tuesday",
      "endTime": "1800",
      "lessonType": "Lecture",
      "startTime": "0900",
      "venue": "SDE-423",
      "weeks": Object {
        "end": "2018-08-07",
        "start": "2018-08-07",
      },
    },
    Object {
      "classNo": "1",
      "day": "Wednesday",
      "endTime": "1800",
      "lessonType": "Lecture",
      "startTime": "0900",
      "venue": "SDE-423",
      "weeks": Object {
        "end": "2018-08-08",
        "start": "2018-08-08",
      },
    },
    Object {
      "classNo": "1",
      "day": "Monday",
      "endTime": "1800",
      "lessonType": "Lecture",
      "startTime": "0900",
      "venue": "SDE-423",
      "weeks": Object {
        "end": "2018-08-06",
        "start": "2018-08-06",
      },
    },
    Object {
      "classNo": "1",
      "day": "Friday",
      "endTime": "1800",
      "lessonType": "Lecture",
      "startTime": "0900",
      "venue": "SDE-423",
      "weeks": Object {
        "end": "2018-08-10",
        "start": "2018-08-10",
      },
    },
    Object {
      "classNo": "1",
      "day": "Saturday",
      "endTime": "1300",
      "lessonType": "Lecture",
      "startTime": "0900",
      "venue": "SDE-423",
      "weeks": Object {
        "end": "2018-08-11",
        "start": "2018-08-11",
      },
    },
  ],
}
`);
  });
});
