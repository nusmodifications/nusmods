// @flow

import { combineModules, mergeAliases } from './CollateModules';
import { mockLogger } from '../utils/test-utils';

describe(combineModules, () => {
  const logger = mockLogger();

  test('should merge modules from different semesters together', () => {
    const ModuleCode = 'ACC1006';
    const Module = {
      AcadYear: '2018/2019',
      Description: 'This course aims to help students understand the role of information...',
      Preclusion: 'Students who have passed FNA1006',
      Faculty: 'Business',
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
          Weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
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
          Weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
          Venue: 'BIZ2-0510',
          DayText: 'Monday',
          LessonType: 'Sectional Teaching',
        },
        {
          ClassNo: 'A2',
          StartTime: '1300',
          EndTime: '1600',
          Weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
          Venue: 'BIZ2-0510',
          DayText: 'Monday',
          LessonType: 'Sectional Teaching',
        },
      ],
      ExamDate: '2019-05-09T13:00:00.000+08:00',
      ExamDuration: 120,
    };

    expect(
      combineModules(
        [
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
        ],
        logger,
      ),
    ).toEqual([
      {
        ...Module,
        SemesterData: [semesterOneData, semesterTwoData],
      },
    ]);
  });
});

const s = (...elements) => new Set(elements);

describe(mergeAliases, () => {
  test('should merge aliases', () => {
    expect(
      mergeAliases([
        {
          GET1025: s('GEK2041'),
          GEK2041: s('GET1025'),
        },
        {
          GET1025: s('GEK2041'),
          GEK2041: s('GET1025'),
        },
      ]),
    ).toEqual({
      GET1025: s('GEK2041'),
      GEK2041: s('GET1025'),
    });

    expect(
      mergeAliases([
        {
          GES1001: s('GEK2041'),
          GET1025: s('GES1001'),
        },
        {
          GET1025: s('GEK2041'),
          GEK2041: s('GET1025'),
        },
      ]),
    ).toEqual({
      GES1001: s('GEK2041'),
      GET1025: s('GEK2041', 'GES1001'),
      GEK2041: s('GET1025'),
    });
  });
});
