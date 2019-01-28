// @flow

import { combineModules } from './CollateModules';

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
    ).toEqual([
      {
        ...Module,
        History: [semesterOneData, semesterTwoData],
      },
    ]);
  });
});
