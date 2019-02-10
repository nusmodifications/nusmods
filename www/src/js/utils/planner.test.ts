// @flow

import type { Semester } from 'types/modules';

/** @var {Module} */
import CS1010S from '__mocks__/modules/CS1010S.json';

import {
  acadYearLabel,
  checkPrerequisite,
  conflictToText,
  fromDroppableId,
  getDroppableId,
  getTotalMC,
} from 'utils/planner';

describe(checkPrerequisite, () => {
  const moduleSet = new Set(['CS1010S', 'CS2107', 'CS2105', 'MA1101R', 'MA1521', 'MA2104']);

  test('should return null if there are no prerequisites', () => {
    // No prerequisites
    expect(
      checkPrerequisite(moduleSet, {
        name: 'CS1010S',
        children: [],
      }),
    ).toBeNull();
  });

  test('should return null if single prerequisite is met', () => {
    expect(
      checkPrerequisite(moduleSet, {
        name: 'CS2107',
        children: [
          {
            name: 'CS1010S',
            children: [],
          },
        ],
      }),
    ).toBeNull();
  });

  test('should return null if all prerequisites are met', () => {
    // Or operator
    expect(
      checkPrerequisite(moduleSet, {
        name: 'or',
        children: [
          {
            name: 'MA1521',
            children: [],
          },
          {
            name: 'MA1102',
            children: [],
          },
        ],
      }),
    ).toBeNull();

    // And operator
    expect(
      checkPrerequisite(moduleSet, {
        name: 'and',
        children: [
          {
            name: 'MA1521',
            children: [],
          },
          {
            name: 'MA1101R',
            children: [],
          },
        ],
      }),
    ).toBeNull();
  });

  test('should return module that are not fulfilled', () => {
    expect(
      checkPrerequisite(moduleSet, {
        name: 'CS2040',
        children: [
          {
            name: 'CS2030',
            children: [],
          },
        ],
      }),
    ).toEqual([
      {
        name: 'CS2030',
        children: [],
      },
    ]);
  });

  test('should return all modules that are not fulfilled', () => {
    expect(
      checkPrerequisite(moduleSet, {
        name: 'CS2040',
        children: [
          {
            name: 'or',
            children: [
              {
                name: 'CS2030',
                children: [],
              },
              {
                name: 'CS1020',
                children: [],
              },
            ],
          },
        ],
      }),
    ).toEqual([
      {
        name: 'or',
        children: [
          {
            name: 'CS2030',
            children: [],
          },
          {
            name: 'CS1020',
            children: [],
          },
        ],
      },
    ]);
  });
});

describe(conflictToText, () => {
  test('should describe single modules', () => {
    expect(
      conflictToText({
        name: 'CS1010S',
        children: [],
      }),
    ).toEqual('CS1010S');
  });
});

describe(getDroppableId, () => {
  test('should convert from and to ID', () => {
    const checkDroppableId = (acadYear: string, semester: Semester) =>
      expect(fromDroppableId(getDroppableId(acadYear, semester))).toEqual([acadYear, semester]);

    checkDroppableId('2018/2019', 1);
    checkDroppableId('2018/2019', 2);
    checkDroppableId('2018/2019', 3);
    checkDroppableId('2018/2019', 4);
  });
});

describe(acadYearLabel, () => {
  test('should remove 20 prefix from AY', () => {
    expect(acadYearLabel('2018/2019')).toEqual('18/19');

    // Don't remove every '20' in the string
    expect(acadYearLabel('2019/2020')).toEqual('19/20');
  });
});

describe(getTotalMC, () => {
  test('should return 0 for empty array', () => {
    expect(getTotalMC([])).toEqual(0);
  });

  test('should use 0 for module with no data', () => {
    expect(getTotalMC([{ moduleCode: 'CS2020' }, { moduleCode: 'CS1010S' }])).toEqual(0);
  });

  test('should merge module credit from module info and custom info', () => {
    expect(
      getTotalMC([
        { moduleCode: 'CS2020', customInfo: { moduleCredit: 6 } },
        { moduleCode: 'CS1010S', moduleInfo: CS1010S },
      ]),
    ).toEqual(10);
  });
});
