import { mapValues } from 'lodash';

import type { SemesterData, Module } from '../types/modules';
import { combineModules, mergeAliases, moduleDataCheck } from './CollateModules';
import { mockLogger } from '../utils/test-utils';

vi.mock('../services/io/elastic');

describe(combineModules, () => {
  const logger = mockLogger();

  test('should merge modules from different semesters together', () => {
    const moduleCode = 'ACC1006';
    const module = {
      acadYear: '2018/2019',
      department: 'Accounting',
      description: 'This course aims to help students understand the role of information...',
      faculty: 'Business',
      moduleCode: 'ACC1006',
      moduleCredit: '4',
      preclusion: 'Students who have passed FNA1006',
      prerequisite: 'FNA1002 or ACC1002',
      title: 'Accounting Information Systems',
      workload: [0, 3, 0, 4, 3],
    };

    const semesterOneData: SemesterData = {
      covidZones: ['A'],
      examDate: '2018-12-06T13:00:00.000+08:00',
      examDuration: 120,
      semester: 1,
      timetable: [
        {
          classNo: 'A1',
          covidZone: 'A',
          day: 'Thursday',
          endTime: '1700',
          lessonType: 'Sectional Teaching',
          size: 20,
          startTime: '1400',
          venue: 'UTSRC-LT51',
          weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        },
      ],
    };

    const semesterTwoData: SemesterData = {
      covidZones: ['C'],
      examDate: '2019-05-09T13:00:00.000+08:00',
      examDuration: 120,
      semester: 2,
      timetable: [
        {
          classNo: 'A1',
          covidZone: 'C',
          day: 'Monday',
          endTime: '1200',
          lessonType: 'Sectional Teaching',
          size: 20,
          startTime: '0900',
          venue: 'BIZ2-0510',
          weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        },
        {
          classNo: 'A2',
          covidZone: 'C',
          day: 'Monday',
          endTime: '1600',
          lessonType: 'Sectional Teaching',
          size: 20,
          startTime: '1300',
          venue: 'BIZ2-0510',
          weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        },
      ],
    };

    expect(
      combineModules(
        [
          [
            {
              module,
              moduleCode,
              semesterData: semesterOneData,
            },
          ],
          [
            {
              module,
              moduleCode,
              semesterData: semesterTwoData,
            },
          ],
          [
            {
              module,
              moduleCode,
              // No semesterData - should be ignored
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

    // 2 modules without semesterData - should result in empty semesterData array.
    expect(
      combineModules([[{ module, moduleCode }], [{ module, moduleCode }]], {}, logger),
    ).toEqual([
      {
        ...module,
        semesterData: [],
      },
    ]);
  });
});

describe(moduleDataCheck, () => {
  const semesterModule = {
    acadYear: '2018/2019',
    department: 'Accounting',
    description: 'This course aims to help students understand the role of information...',
    faculty: 'Business',
    moduleCode: 'ACC1006',
    moduleCredit: '4',
    preclusion: 'Students who have passed FNA1006',
    prerequisite: 'FNA1002 or ACC1002',
    title: 'Accounting Information Systems',
    workload: [0, 3, 0, 4, 3],
  };

  const module: Module = {
    ...semesterModule,
    aliases: ['ACC1006X'],
    semesterData: [
      {
        covidZones: ['A'],
        examDate: '2018-12-06T13:00:00.000+08:00',
        examDuration: 120,
        semester: 1,
        timetable: [
          {
            classNo: 'A1',
            covidZone: 'A',
            day: 'Thursday',
            endTime: '1700',
            lessonType: 'Sectional Teaching',
            size: 20,
            startTime: '1400',
            venue: 'UTSRC-LT51',
            weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
          },
        ],
      },
    ],
  };

  test('should return null if the two are the same', () => {
    expect(moduleDataCheck(module, semesterModule)).toBeNull();
  });

  test('should return keys that are different', () => {
    expect(
      moduleDataCheck(
        {
          ...module,
          // Change workload
          workload: [0, 3, 1, 3, 3],
          // Add corequisite
          corequisite: 'ACC1006C',
        },
        semesterModule,
      ),
    ).toEqual({
      left: {
        corequisite: 'ACC1006C',
        workload: [0, 3, 1, 3, 3],
      },
      right: {
        corequisite: undefined,
        workload: [0, 3, 0, 4, 3],
      },
    });
  });
});

const s = <T>(...elements: Array<T>) => new Set(elements);
const sortArray = <T>(arr: Array<T>) => arr.sort();
const expectAliasesEqual = (
  actual: { [moduleCode: string]: Array<string> },
  expected: { [moduleCode: string]: Array<string> },
) => {
  expect(mapValues(actual, sortArray)).toEqual(mapValues(expected, sortArray));
};

describe(mergeAliases, () => {
  test('should merge aliases', () => {
    expectAliasesEqual(
      mergeAliases([
        {
          GEK2041: s('GET1025'),
          GET1025: s('GEK2041'),
        },
        {
          GEK2041: s('GET1025'),
          GET1025: s('GEK2041'),
        },
      ]),
      {
        GEK2041: ['GET1025'],
        GET1025: ['GEK2041'],
      },
    );

    expectAliasesEqual(
      mergeAliases([
        {
          GES1001: s('GEK2041'),
          GET1025: s('GES1001'),
        },
        {
          GEK2041: s('GET1025'),
          GET1025: s('GEK2041'),
        },
      ]),
      {
        GEK2041: ['GET1025'],
        GES1001: ['GEK2041'],
        GET1025: ['GEK2041', 'GES1001'],
      },
    );
  });
});
