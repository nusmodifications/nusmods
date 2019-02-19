import CS4238Timetable from './fixtures/timetable/CS4238.json';
import MA2213Timetable from './fixtures/timetable/MA2213.json';
import CS2100Timetable from './fixtures/timetable/CS2100_2.json';
import CN4205ETimetable from './fixtures/timetable/CN4205E.json';
import CS1010XTimetable from './fixtures/timetable/CS1010X.json';

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
    "ClassNo": "1",
    "DayText": "Wednesday",
    "EndTime": "2030",
    "LessonType": "Lecture",
    "StartTime": "1800",
    "Venue": "E5-03-23",
    "Weeks": Object {
      "range": Object {
        "end": "2018-11-21T00:00:00.000Z",
        "start": "2018-08-15T00:00:00.000Z",
      },
    },
  },
  Object {
    "ClassNo": "1",
    "DayText": "Wednesday",
    "EndTime": "2130",
    "LessonType": "Tutorial",
    "StartTime": "2030",
    "Venue": "E5-03-23",
    "Weeks": Object {
      "range": Object {
        "end": "2018-11-21T00:00:00.000Z",
        "start": "2018-08-15T00:00:00.000Z",
      },
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
        ClassNo: '1',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Monday',
        StartTime: '2030',
        EndTime: '2130',
        Venue: 'COM1-B113',
      },
      {
        ClassNo: '2',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Tuesday',
        StartTime: '2030',
        EndTime: '2130',
        Venue: 'COM1-B113',
      },
      {
        ClassNo: '1',
        LessonType: 'Lecture',
        Weeks: EVERY_WEEK,
        DayText: 'Monday',
        StartTime: '1830',
        EndTime: '2030',
        Venue: 'COM1-B113',
      },
      {
        ClassNo: '2',
        LessonType: 'Lecture',
        Weeks: EVERY_WEEK,
        DayText: 'Tuesday',
        StartTime: '1830',
        EndTime: '2030',
        Venue: 'COM1-B113',
      },
    ]);
  });

  // MA2213 is more complicated, with some alternating lessons for lab and tutorials
  test('should map MA2213 timetable lessons correctly', async () => {
    const task = createTask(MA2213Timetable);
    const timetable = await task.run();
    expectLessonsEqual(timetable.MA2213, [
      {
        ClassNo: '1',
        LessonType: 'Laboratory',
        Weeks: [3, 5, 7, 9, 11],
        DayText: 'Tuesday',
        StartTime: '1100',
        EndTime: '1200',
        Venue: 'S17-0304',
      },
      {
        ClassNo: '2',
        LessonType: 'Laboratory',
        Weeks: [3, 5, 7, 9, 11],
        DayText: 'Monday',
        StartTime: '1700',
        EndTime: '1800',
        Venue: 'S17-0304',
      },
      {
        ClassNo: '3',
        LessonType: 'Laboratory',
        Weeks: [3, 5, 7, 9, 11],
        DayText: 'Tuesday',
        StartTime: '1600',
        EndTime: '1700',
        Venue: 'S17-0304',
      },
      {
        ClassNo: '4',
        LessonType: 'Laboratory',
        Weeks: [3, 5, 7, 9, 11],
        DayText: 'Wednesday',
        StartTime: '1400',
        EndTime: '1500',
        Venue: 'S17-0304',
      },
      {
        ClassNo: '1',
        LessonType: 'Lecture',
        Weeks: EVERY_WEEK,
        DayText: 'Monday',
        StartTime: '0800',
        EndTime: '1000',
        Venue: 'LT34',
      },
      {
        ClassNo: '1',
        LessonType: 'Lecture',
        Weeks: EVERY_WEEK,
        DayText: 'Wednesday',
        StartTime: '1000',
        EndTime: '1200',
        Venue: 'LT33',
      },
      {
        ClassNo: '1',
        LessonType: 'Tutorial',
        Weeks: [4, 6, 8, 10, 12],
        DayText: 'Tuesday',
        StartTime: '1100',
        EndTime: '1200',
        Venue: 'S17-0404',
      },
      {
        ClassNo: '2',
        LessonType: 'Tutorial',
        Weeks: [4, 6, 8, 10, 12],
        DayText: 'Monday',
        StartTime: '1700',
        EndTime: '1800',
        Venue: 'S17-0404',
      },
      {
        ClassNo: '3',
        LessonType: 'Tutorial',
        Weeks: [4, 6, 8, 10, 12],
        DayText: 'Tuesday',
        StartTime: '1600',
        EndTime: '1700',
        Venue: 'S17-0611',
      },
      {
        ClassNo: '4',
        LessonType: 'Tutorial',
        Weeks: [4, 6, 8, 10, 12],
        DayText: 'Wednesday',
        StartTime: '1400',
        EndTime: '1500',
        Venue: 'S17-0404',
      },
    ]);
  });

  // CS2100 has a lot of lessons, and two joined lecture groups
  test('should map CS2100 timetable lessons correctly', async () => {
    const task = createTask(CS2100Timetable, 2);
    const timetable = await task.run();

    expectLessonsEqual(timetable.CS2100, [
      {
        ClassNo: '01',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Monday',
        StartTime: '0800',
        EndTime: '0900',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '02',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Monday',
        StartTime: '0900',
        EndTime: '1000',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '03',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Monday',
        StartTime: '1000',
        EndTime: '1100',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '04',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Monday',
        StartTime: '1100',
        EndTime: '1200',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '05',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Monday',
        StartTime: '1200',
        EndTime: '1300',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '06',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Monday',
        StartTime: '1300',
        EndTime: '1400',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '07',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Monday',
        StartTime: '1400',
        EndTime: '1500',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '08',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Monday',
        StartTime: '1500',
        EndTime: '1600',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '09',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Monday',
        StartTime: '1600',
        EndTime: '1700',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '10',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Monday',
        StartTime: '1700',
        EndTime: '1800',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '11',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Thursday',
        StartTime: '0800',
        EndTime: '0900',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '12',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Thursday',
        StartTime: '0900',
        EndTime: '1000',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '13',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Thursday',
        StartTime: '1000',
        EndTime: '1100',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '14',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Thursday',
        StartTime: '1100',
        EndTime: '1200',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '15',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Thursday',
        StartTime: '1200',
        EndTime: '1300',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '16',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Thursday',
        StartTime: '1300',
        EndTime: '1400',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '17',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Thursday',
        StartTime: '1400',
        EndTime: '1500',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '18',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Thursday',
        StartTime: '1500',
        EndTime: '1600',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '19',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Thursday',
        StartTime: '1600',
        EndTime: '1700',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '20',
        LessonType: 'Laboratory',
        Weeks: EVERY_WEEK,
        DayText: 'Thursday',
        StartTime: '1700',
        EndTime: '1800',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '1',
        LessonType: 'Lecture',
        Weeks: EVERY_WEEK,
        DayText: 'Tuesday',
        StartTime: '1600',
        EndTime: '1800',
        Venue: 'I3-AUD',
      },
      {
        ClassNo: '1',
        LessonType: 'Lecture',
        Weeks: EVERY_WEEK,
        DayText: 'Wednesday',
        StartTime: '1400',
        EndTime: '1500',
        Venue: 'I3-AUD',
      },
      {
        ClassNo: '2',
        LessonType: 'Lecture',
        Weeks: EVERY_WEEK,
        DayText: 'Monday',
        StartTime: '1000',
        EndTime: '1200',
        Venue: 'I3-AUD',
      },
      {
        ClassNo: '2',
        LessonType: 'Lecture',
        Weeks: EVERY_WEEK,
        DayText: 'Wednesday',
        StartTime: '1500',
        EndTime: '1600',
        Venue: 'I3-AUD',
      },
      {
        ClassNo: '01',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Wednesday',
        StartTime: '1100',
        EndTime: '1200',
        Venue: 'COM1-0207',
      },
      {
        ClassNo: '02',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Friday',
        StartTime: '0900',
        EndTime: '1000',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '03',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Tuesday',
        StartTime: '1000',
        EndTime: '1100',
        Venue: 'COM1-0207',
      },
      {
        ClassNo: '04',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Wednesday',
        StartTime: '1100',
        EndTime: '1200',
        Venue: 'COM1-0201',
      },
      {
        ClassNo: '05',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Friday',
        StartTime: '1100',
        EndTime: '1200',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '06',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Friday',
        StartTime: '1200',
        EndTime: '1300',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '07',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Tuesday',
        StartTime: '1300',
        EndTime: '1400',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '08',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Monday',
        StartTime: '1200',
        EndTime: '1300',
        Venue: 'COM1-0207',
      },
      {
        ClassNo: '09',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Monday',
        StartTime: '1600',
        EndTime: '1700',
        Venue: 'COM1-0203',
      },
      {
        ClassNo: '10',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Tuesday',
        StartTime: '0900',
        EndTime: '1000',
        Venue: 'COM1-0201',
      },
      {
        ClassNo: '11',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Monday',
        StartTime: '1500',
        EndTime: '1600',
        Venue: 'COM1-0203',
      },
      {
        ClassNo: '12',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Thursday',
        StartTime: '1700',
        EndTime: '1800',
        Venue: 'COM1-0207',
      },
      {
        ClassNo: '13',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Wednesday',
        StartTime: '1000',
        EndTime: '1100',
        Venue: 'COM1-0207',
      },
      {
        ClassNo: '14',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Tuesday',
        StartTime: '1100',
        EndTime: '1200',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '15',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Friday',
        StartTime: '0800',
        EndTime: '0900',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '16',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Wednesday',
        StartTime: '1200',
        EndTime: '1300',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '17',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Wednesday',
        StartTime: '1300',
        EndTime: '1400',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '18',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Friday',
        StartTime: '1300',
        EndTime: '1400',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '19',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Friday',
        StartTime: '1400',
        EndTime: '1500',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '20',
        LessonType: 'Tutorial',
        Weeks: EVERY_WEEK,
        DayText: 'Friday',
        StartTime: '1500',
        EndTime: '1600',
        Venue: 'COM1-0209',
      },
    ]);
  });

  test('should map CS1010X timetable lessons correctly', async () => {
    const task = createTask(CS1010XTimetable as TimetableLesson[]);
    const output = await task.run();

    expect(output).toMatchInlineSnapshot(`
Object {
  "CS1010X": Array [
    Object {
      "ClassNo": "1",
      "DayText": "Thursday",
      "EndTime": "1000",
      "LessonType": "Recitation",
      "StartTime": "0900",
      "Venue": "SR_LT19",
      "Weeks": Object {
        "range": Object {
          "end": "2019-06-20T00:00:00.000Z",
          "start": "2019-01-17T00:00:00.000Z",
        },
      },
    },
    Object {
      "ClassNo": "2",
      "DayText": "Thursday",
      "EndTime": "1300",
      "LessonType": "Recitation",
      "StartTime": "1200",
      "Venue": "SR_LT19",
      "Weeks": Object {
        "range": Object {
          "end": "2019-06-20T00:00:00.000Z",
          "start": "2019-01-17T00:00:00.000Z",
        },
      },
    },
    Object {
      "ClassNo": "01",
      "DayText": "Thursday",
      "EndTime": "1100",
      "LessonType": "Tutorial",
      "StartTime": "1000",
      "Venue": "SR_LT19",
      "Weeks": Object {
        "range": Object {
          "end": "2019-06-20T00:00:00.000Z",
          "start": "2019-01-17T00:00:00.000Z",
        },
      },
    },
    Object {
      "ClassNo": "02",
      "DayText": "Thursday",
      "EndTime": "1200",
      "LessonType": "Tutorial",
      "StartTime": "1100",
      "Venue": "SR_LT19",
      "Weeks": Object {
        "range": Object {
          "end": "2019-06-20T00:00:00.000Z",
          "start": "2019-01-17T00:00:00.000Z",
        },
      },
    },
    Object {
      "ClassNo": "03",
      "DayText": "Thursday",
      "EndTime": "1400",
      "LessonType": "Tutorial",
      "StartTime": "1300",
      "Venue": "SR_LT19",
      "Weeks": Object {
        "range": Object {
          "end": "2019-06-20T00:00:00.000Z",
          "start": "2019-01-17T00:00:00.000Z",
        },
      },
    },
    Object {
      "ClassNo": "04",
      "DayText": "Thursday",
      "EndTime": "1500",
      "LessonType": "Tutorial",
      "StartTime": "1400",
      "Venue": "SR_LT19",
      "Weeks": Object {
        "range": Object {
          "end": "2019-06-20T00:00:00.000Z",
          "start": "2019-01-17T00:00:00.000Z",
        },
      },
    },
  ],
}
`);
  });
});
