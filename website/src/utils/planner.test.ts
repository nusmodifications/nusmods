import { Semester } from 'types/modules';
import { CS1010S } from '__mocks__/modules';

import {
  acadYearLabel,
  checkPrerequisite,
  conflictToText,
  fromDroppableId,
  getDroppableId,
  getTotalMC,
} from 'utils/planner';

describe(checkPrerequisite, () => {
  const moduleSet = new Set([
    'CS1010S',
    'CS2107',
    'CS2105',
    'MA1101R',
    'MA1521',
    'MA2104',
    'NTW2006',
    'UTC1402',
    'UTC1702E',
  ]);

  const moduleSet2 = new Set([
    'LAJ2201',
    'LAJ2202',
    'LAJ2203',
    'JS1101E',
    'JS2101',
    'JS2216',
    'LAJ3201',
  ]);

  test('should return null if single prerequisite is met', () => {
    expect(checkPrerequisite(moduleSet, 'CS1010S')).toHaveLength(0);
  });

  test('should return null if all prerequisites are met', () => {
    // Or operator
    expect(
      checkPrerequisite(moduleSet, {
        or: ['MA1521', 'MA1102'],
      }),
    ).toHaveLength(0);

    // And operator
    expect(
      checkPrerequisite(moduleSet, {
        and: ['MA1521', 'MA1101R'],
      }),
    ).toHaveLength(0);
  });

  test('should return null if single wildcard prerequisites is met', () => {
    expect(checkPrerequisite(moduleSet, 'NTW%')).toHaveLength(0);
    expect(checkPrerequisite(moduleSet, 'UTC14%')).toHaveLength(0);
  });

  test('should return null if all wildcard prerequisites are met', () => {
    // Or operator
    expect(
      checkPrerequisite(moduleSet, {
        or: ['UTC11%', 'UTC14%'],
      }),
    ).toHaveLength(0);

    // And operator
    expect(
      checkPrerequisite(moduleSet, {
        and: ['UTC14%', 'UTC1702%'],
      }),
    ).toHaveLength(0);
  });

  test('should return null if all wildcard prerequisites of "nOf" type prerequisite are met', () => {
    // Or operator
    expect(
      checkPrerequisite(moduleSet2, {
        and: [
          {
            or: ['LAJ3201:D', 'LAJ3203:D'],
          },
          {
            or: [
              {
                nOf: [7, ['JS%:D']],
              },
              {
                and: [
                  {
                    nOf: [4, ['LAJ%:D']],
                  },
                  {
                    nOf: [3, ['JS%:D']],
                  },
                ],
              },
            ],
          },
        ],
      }),
    ).toHaveLength(0);
  });

  test('should return module that are not fulfilled', () => {
    expect(checkPrerequisite(moduleSet, 'CS2030')).toEqual(['CS2030']);
    expect(checkPrerequisite(moduleSet, 'NTW1%')).toEqual(['NTW1%']);
  });

  test('should return all modules that are not fulfilled', () => {
    expect(
      checkPrerequisite(moduleSet, {
        or: ['CS2030', 'CS1020'],
      }),
    ).toEqual([
      {
        or: ['CS2030', 'CS1020'],
      },
    ]);

    expect(
      checkPrerequisite(moduleSet, {
        or: ['CS20%', 'UTC1700%'],
      }),
    ).toEqual([
      {
        or: ['CS20%', 'UTC1700%'],
      },
    ]);
  });
});

describe(conflictToText, () => {
  test('should describe single modules', () => {
    expect(conflictToText('CS1010S')).toEqual('CS1010S');
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
    expect(getTotalMC([{}, {}])).toEqual(0);
  });

  test('should merge module credit from module info and custom info', () => {
    expect(getTotalMC([{ customInfo: { moduleCredit: 6 } }, { moduleInfo: CS1010S }])).toEqual(10);
  });
});
