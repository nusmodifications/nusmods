// @flow

import { sortBy } from 'lodash';
import moment from 'moment';
import departments from './__mocks__/departments.json';
import faculties from './__mocks__/faculties.json';
import CS4238Timetable from './__mocks__/CS4238_timetable.json';
import MA2213Timetable from './__mocks__/MA2213_timetable.json';
import CS2100Timetable from './__mocks__/CS2100_timetable.json';

import {
  combineModules,
  extractVenueAvailability,
  getDepartmentCodeMap,
  getFacultyCodeMap,
  mapExamInfo,
  mapTimetableLessons,
} from './mapper';
import type { RawLesson } from '../types/modules';

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

describe(mapExamInfo, () => {
  test('should map module exam to date strings', () => {
    const actual = mapExamInfo({
      term: '1810',
      start_time: '17:00',
      acad_org: '00301ACAD1',
      module: 'CS2100',
      end_time: '19:00',
      duration: 120,
      exam_date: '2018-11-27',
    });

    expect(moment(actual.ExamDate, moment.ISO_8601).isValid()).toBe(true);

    expect(actual).toEqual({
      ExamDate: '2018-11-27T17:00:00.000+08:00',
      ExamDuration: 120,
    });
  });
});

describe(extractVenueAvailability, () => {
  test('should map lessons to venues', () => {
    expect(
      extractVenueAvailability('CS3216', [
        {
          ClassNo: '1',
          StartTime: '1830',
          EndTime: '2030',
          WeekText: 'Every Week',
          Venue: 'COM1-VCRM',
          DayText: 'Monday',
          LessonType: 'Lecture',
        },
      ]),
    ).toEqual({
      'COM1-VCRM': [
        {
          Day: 'Monday',
          Classes: [
            {
              ModuleCode: 'CS3216',
              ClassNo: '1',
              StartTime: '1830',
              EndTime: '2030',
              WeekText: 'Every Week',
              DayText: 'Monday',
              LessonType: 'Lecture',
            },
          ],
          Availability: {
            // '1000': 'vacant',
            // '1030': 'vacant',
            // '1100': 'vacant',
            // '1130': 'vacant',
            // '1200': 'vacant',
            // '1230': 'vacant',
            // '1300': 'vacant',
            // '1330': 'vacant',
            // '1400': 'vacant',
            // '1430': 'vacant',
            // '1500': 'vacant',
            // '1530': 'vacant',
            // '1600': 'vacant',
            // '1630': 'vacant',
            // '1700': 'vacant',
            // '1730': 'vacant',
            // '1800': 'vacant',
            '1830': 'occupied',
            '1900': 'occupied',
            '1930': 'occupied',
            '2000': 'occupied',
            // '2030': 'vacant',
            // '2100': 'vacant',
            // '2130': 'vacant',
            // '2200': 'vacant',
            // '2230': 'vacant',
            // '2300': 'vacant',
            // '2330': 'vacant',
            // '0600': 'vacant',
            // '0630': 'vacant',
            // '0700': 'vacant',
            // '0730': 'vacant',
            // '0800': 'vacant',
            // '0830': 'vacant',
            // '0900': 'vacant',
            // '0930': 'vacant',
          },
        },
      ],
    });
  });

  test('should not map lessons that have no venue', () => {
    expect(
      extractVenueAvailability('CS3216', [
        {
          ClassNo: '1',
          StartTime: '1830',
          EndTime: '2030',
          WeekText: 'Every Week',
          Venue: '',
          DayText: 'Monday',
          LessonType: 'Lecture',
        },
      ]),
    ).toEqual({});
  });
});

describe(combineModules, () => {
  test('should merge modules from different semesters together', () => {
    const ModuleCode = 'ACC1006';
    const Module = {
      AcadYear: '2018/2019',
      Description: 'This course aims to help students understand the role of information...',
      Preclusion: 'Students who have passed FNA1006',
      Department: 'Accounting',
      ModuleTitle: 'Accounting Information Systems',
      Workload: '0-3-0-4-3',
      Prerequisite: 'FNA1002 or ACC1002',
      Corequisite: '',
      ModuleCredit: '4',
      ModuleCode: 'ACC1006',
    };

    const semesterOneData = {
      Semester: 1,
      Timetable: [
        {
          ClassNo: 'A1',
          StartTime: '1400',
          EndTime: '1700',
          WeekText: 'Every Week',
          Venue: 'UTSRC-LT51',
          DayText: 'Thursday',
          LessonType: 'Sectional Teaching',
        },
      ],
      ExamDate: '2018-12-06T13:00:00.000+08:00',
      ExamDuration: 120,
    };

    const semesterTwoData = {
      Semester: 2,
      Timetable: [
        {
          ClassNo: 'A1',
          StartTime: '0900',
          EndTime: '1200',
          WeekText: 'Every Week',
          Venue: 'BIZ2-0510',
          DayText: 'Monday',
          LessonType: 'Sectional Teaching',
        },
        {
          ClassNo: 'A2',
          StartTime: '1300',
          EndTime: '1600',
          WeekText: 'Every Week',
          Venue: 'BIZ2-0510',
          DayText: 'Monday',
          LessonType: 'Sectional Teaching',
        },
      ],
      ExamDate: '2019-05-09T13:00:00.000+08:00',
      ExamDuration: 120,
    };

    expect(
      combineModules([
        [
          {
            ModuleCode,
            Module,
            SemesterData: semesterOneData,
          },
        ],
        [
          {
            ModuleCode,
            Module,
            SemesterData: semesterTwoData,
          },
        ],
      ]),
    ).toEqual({
      ACC1006: {
        ...Module,
        History: [semesterOneData, semesterTwoData],
      },
    });
  });
});

describe(mapTimetableLessons, () => {
  function serializeLesson(lesson: RawLesson) {
    return [
      lesson.LessonType,
      lesson.ClassNo,
      lesson.StartTime,
      lesson.WeekText,
      lesson.DayText,
      lesson.Venue,
    ].join('|');
  }

  function expectLessonsEqual(actual, expected) {
    // Sort both expected and actual lessons because Jest expects
    // array to be in the same order
    expect(sortBy(actual, serializeLesson)).toEqual(sortBy(expected, serializeLesson));
  }

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
