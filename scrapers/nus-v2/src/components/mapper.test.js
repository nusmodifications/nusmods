// @flow

import departments from './__mocks__/departments.json';
import faculties from './__mocks__/faculties.json';
import CS4238Timetable from './__mocks__/CS4238_timetable.json';

import { getDepartmentCodeMap, getFacultyCodeMap, mapTimetableLessons } from './mapper';

describe(getFacultyCodeMap, () => {
  test('should map faculty codes to their description', () => {
    expect(getFacultyCodeMap(faculties)).toEqual({
      '001': 'Faculty of Arts & Social Sci',
      '002': 'NUS Business School',
      '003': 'School of Computing',
      '004': 'Faculty of Dentistry',
      '005': 'School of Design & Environment',
      '006': 'Faculty of Engineering',
      '007': 'Faculty of Law',
    });
  });
});

describe(getDepartmentCodeMap, () => {
  test('should map department codes to their description', () => {
    expect(getDepartmentCodeMap(departments)).toEqual({
      '001': 'Arts & Social Sciences',
      '00100ACAD1': 'FASS DO/Office of Programmes',
      '00101ACAD1': 'Chinese Studies',
      '00102ACAD1': 'Communications & New Media',
      '00103ACAD1': 'Economics',
    });
  });
});

describe(mapTimetableLessons, () => {
  test('should map timetable lessons correctly', () => {
    expect(mapTimetableLessons(CS4238Timetable)).toEqual([
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
    ]);
  });
});
