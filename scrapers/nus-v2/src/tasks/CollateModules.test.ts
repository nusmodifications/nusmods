import { mapValues } from 'lodash';
import { combineModules, mergeAliases } from './CollateModules';
import { mockLogger } from '../utils/test-utils';

describe(combineModules, () => {
  const logger = mockLogger();

  test('should merge modules from different semesters together', () => {
    const moduleCode = 'ACC1006';
    const module = {
      acadYear: '2018/2019',
      description: 'This course aims to help students understand the role of information...',
      preclusion: 'Students who have passed FNA1006',
      faculty: 'Business',
      department: 'Accounting',
      title: 'Accounting Information Systems',
      workload: '0-3-0-4-3',
      prerequisite: 'FNA1002 or ACC1002',
      corequisite: '',
      moduleCredit: '4',
      moduleCode: 'ACC1006',
    };

    const semesterOneData = {
      semester: 1,
      timetable: [
        {
          classNo: 'A1',
          startTime: '1400',
          endTime: '1700',
          weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
          venue: 'UTSRC-LT51',
          day: 'Thursday',
          lessonType: 'Sectional Teaching',
        },
      ],
      examDate: '2018-12-06T13:00:00.000+08:00',
      examDuration: 120,
    };

    const semesterTwoData = {
      semester: 2,
      timetable: [
        {
          classNo: 'A1',
          startTime: '0900',
          endTime: '1200',
          weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
          venue: 'BIZ2-0510',
          day: 'Monday',
          lessonType: 'Sectional Teaching',
        },
        {
          classNo: 'A2',
          startTime: '1300',
          endTime: '1600',
          weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
          venue: 'BIZ2-0510',
          day: 'Monday',
          lessonType: 'Sectional Teaching',
        },
      ],
      examDate: '2019-05-09T13:00:00.000+08:00',
      examDuration: 120,
    };

    expect(
      combineModules(
        [
          [
            {
              moduleCode,
              module,
              semesterData: semesterOneData,
            },
          ],
          [
            {
              moduleCode,
              module,
              semesterData: semesterTwoData,
            },
          ],
        ],
        {},
        logger,
      ),
    ).toEqual([
      {
        ...module,
        semesterData: [semesterOneData, semesterTwoData],
      },
    ]);
  });
});

const s = <T>(...elements: T[]) => new Set(elements);
const sortArray = <T>(arr: T[]) => arr.sort();
const expectAliasesEqual = (
  actual: { [moduleCode: string]: string[] },
  expected: { [moduleCode: string]: string[] },
) => {
  expect(mapValues(actual, sortArray)).toEqual(mapValues(expected, sortArray));
};

describe(mergeAliases, () => {
  test('should merge aliases', () => {
    expectAliasesEqual(
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
      {
        GET1025: ['GEK2041'],
        GEK2041: ['GET1025'],
      },
    );

    expectAliasesEqual(
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
      {
        GES1001: ['GEK2041'],
        GET1025: ['GEK2041', 'GES1001'],
        GEK2041: ['GET1025'],
      },
    );
  });
});
