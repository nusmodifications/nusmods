// @flow

import CS4238Timetable from "./fixtures/timetable/CS4238";
import MA2213Timetable from "./fixtures/timetable/MA2213";
import CS2100Timetable from "./fixtures/timetable/CS2100_2";
import GetModuleTimetable, { mapTimetableLessons } from "./GetModuleTimetable";
import { expectLessonsEqual } from "../utils/test-utils";

describe(mapTimetableLessons, () => {
  test('should map empty timetable lessons', () => {
    expect(mapTimetableLessons([])).toEqual([]);
  });

  // CS4238 is relatively simple - two lesson types, four lessons, every week
  test('should map CS4238 timetable lessons correctly', () => {
    const expected = [
      {
        ClassNo: '1',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '2030',
        EndTime: '2130',
        Venue: 'COM1-B113',
      },
      {
        ClassNo: '2',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Tuesday',
        StartTime: '2030',
        EndTime: '2130',
        Venue: 'COM1-B113',
      },
      {
        ClassNo: '1',
        LessonType: 'Lecture',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '1830',
        EndTime: '2030',
        Venue: 'COM1-B113',
      },
      {
        ClassNo: '2',
        LessonType: 'Lecture',
        WeekText: 'Every Week',
        DayText: 'Tuesday',
        StartTime: '1830',
        EndTime: '2030',
        Venue: 'COM1-B113',
      },
    ];

    expectLessonsEqual(mapTimetableLessons(CS4238Timetable), expected);
  });

  // MA2213 is more complicated, with some alternating lessons for lab and tutorials
  test('should map MA2213 timetable lessons correctly', () => {
    const expected = [
      {
        ClassNo: '1',
        LessonType: 'Laboratory',
        WeekText: '3,5,7,9,11',
        DayText: 'Tuesday',
        StartTime: '1100',
        EndTime: '1200',
        Venue: 'S17-0304',
      },
      {
        ClassNo: '2',
        LessonType: 'Laboratory',
        WeekText: '3,5,7,9,11',
        DayText: 'Monday',
        StartTime: '1700',
        EndTime: '1800',
        Venue: 'S17-0304',
      },
      {
        ClassNo: '3',
        LessonType: 'Laboratory',
        WeekText: '3,5,7,9,11',
        DayText: 'Tuesday',
        StartTime: '1600',
        EndTime: '1700',
        Venue: 'S17-0304',
      },
      {
        ClassNo: '4',
        LessonType: 'Laboratory',
        WeekText: '3,5,7,9,11',
        DayText: 'Wednesday',
        StartTime: '1400',
        EndTime: '1500',
        Venue: 'S17-0304',
      },
      {
        ClassNo: '1',
        LessonType: 'Lecture',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '0800',
        EndTime: '1000',
        Venue: 'LT34',
      },
      {
        ClassNo: '1',
        LessonType: 'Lecture',
        WeekText: 'Every Week',
        DayText: 'Wednesday',
        StartTime: '1000',
        EndTime: '1200',
        Venue: 'LT33',
      },
      {
        ClassNo: '1',
        LessonType: 'Tutorial',
        WeekText: '4,6,8,10,12',
        DayText: 'Tuesday',
        StartTime: '1100',
        EndTime: '1200',
        Venue: 'S17-0404',
      },
      {
        ClassNo: '2',
        LessonType: 'Tutorial',
        WeekText: '4,6,8,10,12',
        DayText: 'Monday',
        StartTime: '1700',
        EndTime: '1800',
        Venue: 'S17-0404',
      },
      {
        ClassNo: '3',
        LessonType: 'Tutorial',
        WeekText: '4,6,8,10,12',
        DayText: 'Tuesday',
        StartTime: '1600',
        EndTime: '1700',
        Venue: 'S17-0611',
      },
      {
        ClassNo: '4',
        LessonType: 'Tutorial',
        WeekText: '4,6,8,10,12',
        DayText: 'Wednesday',
        StartTime: '1400',
        EndTime: '1500',
        Venue: 'S17-0404',
      },
    ];

    expectLessonsEqual(mapTimetableLessons(MA2213Timetable), expected);
  });

  // CS2100 has a lot of lessons, and two joined lecture groups
  test('should map CS2100 timetable lessons correctly', () => {
    const expected = [
      {
        ClassNo: '01',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '0800',
        EndTime: '0900',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '02',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '0900',
        EndTime: '1000',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '03',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '1000',
        EndTime: '1100',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '04',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '1100',
        EndTime: '1200',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '05',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '1200',
        EndTime: '1300',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '06',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '1300',
        EndTime: '1400',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '07',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '1400',
        EndTime: '1500',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '08',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '1500',
        EndTime: '1600',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '09',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '1600',
        EndTime: '1700',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '10',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '1700',
        EndTime: '1800',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '11',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Thursday',
        StartTime: '0800',
        EndTime: '0900',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '12',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Thursday',
        StartTime: '0900',
        EndTime: '1000',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '13',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Thursday',
        StartTime: '1000',
        EndTime: '1100',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '14',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Thursday',
        StartTime: '1100',
        EndTime: '1200',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '15',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Thursday',
        StartTime: '1200',
        EndTime: '1300',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '16',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Thursday',
        StartTime: '1300',
        EndTime: '1400',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '17',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Thursday',
        StartTime: '1400',
        EndTime: '1500',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '18',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Thursday',
        StartTime: '1500',
        EndTime: '1600',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '19',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Thursday',
        StartTime: '1600',
        EndTime: '1700',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '20',
        LessonType: 'Laboratory',
        WeekText: 'Every Week',
        DayText: 'Thursday',
        StartTime: '1700',
        EndTime: '1800',
        Venue: 'COM1-0113',
      },
      {
        ClassNo: '1',
        LessonType: 'Lecture',
        WeekText: 'Every Week',
        DayText: 'Tuesday',
        StartTime: '1600',
        EndTime: '1800',
        Venue: 'I3-AUD',
      },
      {
        ClassNo: '1',
        LessonType: 'Lecture',
        WeekText: 'Every Week',
        DayText: 'Wednesday',
        StartTime: '1400',
        EndTime: '1500',
        Venue: 'I3-AUD',
      },
      {
        ClassNo: '2',
        LessonType: 'Lecture',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '1000',
        EndTime: '1200',
        Venue: 'I3-AUD',
      },
      {
        ClassNo: '2',
        LessonType: 'Lecture',
        WeekText: 'Every Week',
        DayText: 'Wednesday',
        StartTime: '1500',
        EndTime: '1600',
        Venue: 'I3-AUD',
      },
      {
        ClassNo: '01',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Wednesday',
        StartTime: '1100',
        EndTime: '1200',
        Venue: 'COM1-0207',
      },
      {
        ClassNo: '02',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Friday',
        StartTime: '0900',
        EndTime: '1000',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '03',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Tuesday',
        StartTime: '1000',
        EndTime: '1100',
        Venue: 'COM1-0207',
      },
      {
        ClassNo: '04',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Wednesday',
        StartTime: '1100',
        EndTime: '1200',
        Venue: 'COM1-0201',
      },
      {
        ClassNo: '05',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Friday',
        StartTime: '1100',
        EndTime: '1200',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '06',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Friday',
        StartTime: '1200',
        EndTime: '1300',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '07',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Tuesday',
        StartTime: '1300',
        EndTime: '1400',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '08',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '1200',
        EndTime: '1300',
        Venue: 'COM1-0207',
      },
      {
        ClassNo: '09',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '1600',
        EndTime: '1700',
        Venue: 'COM1-0203',
      },
      {
        ClassNo: '10',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Tuesday',
        StartTime: '0900',
        EndTime: '1000',
        Venue: 'COM1-0201',
      },
      {
        ClassNo: '11',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Monday',
        StartTime: '1500',
        EndTime: '1600',
        Venue: 'COM1-0203',
      },
      {
        ClassNo: '12',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Thursday',
        StartTime: '1700',
        EndTime: '1800',
        Venue: 'COM1-0207',
      },
      {
        ClassNo: '13',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Wednesday',
        StartTime: '1000',
        EndTime: '1100',
        Venue: 'COM1-0207',
      },
      {
        ClassNo: '14',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Tuesday',
        StartTime: '1100',
        EndTime: '1200',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '15',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Friday',
        StartTime: '0800',
        EndTime: '0900',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '16',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Wednesday',
        StartTime: '1200',
        EndTime: '1300',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '17',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Wednesday',
        StartTime: '1300',
        EndTime: '1400',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '18',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Friday',
        StartTime: '1300',
        EndTime: '1400',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '19',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Friday',
        StartTime: '1400',
        EndTime: '1500',
        Venue: 'COM1-0209',
      },
      {
        ClassNo: '20',
        LessonType: 'Tutorial',
        WeekText: 'Every Week',
        DayText: 'Friday',
        StartTime: '1500',
        EndTime: '1600',
        Venue: 'COM1-0209',
      },
    ];

    expectLessonsEqual(mapTimetableLessons(CS2100Timetable), expected);
  });
});

describe(GetModuleTimetable, () => {
  test('should not crash if the data is invalid', async () => {
    const task = new GetModuleTimetable('CS1010', 1, '2018/2019');
    const lessons: any = [
      // Invalid lesson
      {
        term: '1810',
        room: null,
        numweeks: 13,
        start_time: '00:00',
        activity: 'L',
        csize: 40,
        module: 'CS1010',
        eventdate: null,
        session: '1',
        end_time: '00:00',
        modgrp: 'L1',
        deptfac: '00602ACAD1',
        day: null,
      },
    ];

    task.api.getModuleTimetable = jest.fn().mockResolvedValue(lessons);
    task.output.timetable = jest.fn();

    const results = await task.run();

    expect(results).toEqual([]);
  });
  test('should filter out invalid lessons', async () => {
    const task = new GetModuleTimetable('CS1010', 1, '2018/2019');
    const lessons: any = [
      // Invalid lesson
      {
        term: '1810',
        room: null,
        numweeks: 13,
        start_time: '00:00',
        activity: 'L',
        csize: 40,
        module: 'CS1010',
        eventdate: null,
        session: '1',
        end_time: '00:00',
        modgrp: 'L1',
        deptfac: '00602ACAD1',
        day: null,
      },
      // Valid lesson
      {
        term: '1810',
        room: 'S16-0436',
        numweeks: 13,
        start_time: '14:00',
        activity: 'R',
        csize: 50,
        module: 'CS1010',
        eventdate: '2018-08-24',
        session: '1',
        end_time: '15:00',
        modgrp: 'R05',
        deptfac: '00301ACAD1',
        day: '5',
      },
    ];

    task.api.getModuleTimetable = jest.fn().mockResolvedValue(lessons);
    task.output.timetable = jest.fn();

    const results = await task.run();

    expect(results).toMatchSnapshot();
    expect(task.output.timetable).toHaveBeenCalled();
  });
});
