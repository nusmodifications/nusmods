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
          {
            modules: [
              {
                module,
                moduleCode,
                semesterData: semesterOneData,
              },
            ],
            semester: 1,
          },
          {
            modules: [
              {
                module,
                moduleCode,
                semesterData: semesterTwoData,
              },
            ],
            semester: 2,
          },
          {
            modules: [
              {
                module,
                moduleCode,
                // No semesterData - should be ignored
              },
            ],
            semester: 3,
          },
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
      combineModules(
        [
          { modules: [{ module, moduleCode }], semester: 1 },
          { modules: [{ module, moduleCode }], semester: 2 },
        ],
        {},
        logger,
      ),
    ).toEqual([
      {
        ...module,
        semesterData: [],
      },
    ]);
  });

  test('should preserve module info when merging preserved semesters', () => {
    const currentYearModule = {
      acadYear: '2025/2026',
      department: 'Computer Science',
      description: 'Updated description',
      faculty: 'Computing',
      moduleCode: 'CS1010S',
      moduleCredit: '4',
      title: 'Programming Methodology',
      workload: [2, 1, 0, 2, 2],
    };

    const previousYearModule = {
      ...currentYearModule,
      acadYear: '2024/2025',
      description: 'Old description',
    };

    const semesterFourData: SemesterData = {
      covidZones: ['A'],
      examDate: '2025-07-28T09:00:00.000+08:00',
      examDuration: 120,
      semester: 4,
      timetable: [
        {
          classNo: '1',
          covidZone: 'A',
          day: 'Monday',
          endTime: '1200',
          lessonType: 'Lecture',
          size: 20,
          startTime: '1000',
          venue: 'LT19',
          weeks: [1, 2, 3, 4, 5, 6],
        },
      ],
    };

    expect(
      combineModules(
        [
          {
            modules: [
              { module: currentYearModule, moduleCode: 'CS1010S', semesterData: undefined },
            ],
            semester: 1,
          },
          {
            modules: [
              {
                module: previousYearModule,
                moduleCode: 'CS1010S',
                semesterData: semesterFourData,
              },
            ],
            semester: 4,
          },
        ],
        {},
        logger,
        { preserveModuleInfoSemesters: new Set([3, 4]) },
      ),
    ).toEqual([
      {
        ...currentYearModule,
        semesterData: [semesterFourData],
      },
    ]);
  });

  test('should keep current-year module info when a preserved batch has no offered modules', () => {
    // Hardening for the AY-migration bug and its edge case: a preserved
    // (previous-AY special term) batch in which NO module is offered - every entry
    // has semesterData: undefined. Because the batch carries its semester
    // explicitly, its stale module info must still not overwrite the current
    // year's, even though the semester cannot be inferred from any timetable.
    const currentYearModule = {
      acadYear: '2026/2027',
      department: 'Geography',
      description: 'New description',
      faculty: 'Arts and Social Science',
      moduleCode: 'GE4204',
      moduleCredit: '4',
      title: "'Slumdog' Cities: Urban Theory from the Margins",
      workload: [0, 0, 0, 3, 7],
    };

    // Same module code, stale info from the previous academic year.
    const previousYearModule = {
      ...currentYearModule,
      acadYear: '2025/2026',
      description: 'Old description',
      title: 'New Geographies of Urban Theory',
    };

    const semesterOneData: SemesterData = {
      covidZones: ['C'],
      semester: 1,
      timetable: [
        {
          classNo: '1',
          covidZone: 'C',
          day: 'Thursday',
          endTime: '1500',
          lessonType: 'Seminar-Style Module Class',
          size: 40,
          startTime: '1200',
          venue: 'AS2-0302',
          weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        },
      ],
    };

    const result = combineModules(
      [
        // Semester 1 (current AY): GE4204 offered with the new title.
        {
          modules: [
            { module: currentYearModule, moduleCode: 'GE4204', semesterData: semesterOneData },
          ],
          semester: 1,
        },
        // Semester 3 (previous-AY special term): GE4204 present but not offered,
        // and no module in the batch is offered at all (all semesterData undefined).
        {
          modules: [{ module: previousYearModule, moduleCode: 'GE4204', semesterData: undefined }],
          semester: 3,
        },
      ],
      {},
      logger,
      { preserveModuleInfoSemesters: new Set([3, 4]) },
    );

    const ge4204 = result.find((module) => module.moduleCode === 'GE4204');
    expect(ge4204).toEqual({
      ...currentYearModule,
      semesterData: [semesterOneData],
    });
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
