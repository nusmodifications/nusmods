import { Semester } from 'types/modules';
import { CS1010S, GEQ1917 } from '__mocks__/modules';

import {
  acadYearLabel,
  checkPrerequisite,
  conflictToText,
  fromDroppableId,
  getDroppableId,
  getTotalMC,
  isYearLong,
} from 'utils/planner';

describe(checkPrerequisite, () => {
  const moduleSet = new Set(['CS1010S', 'CS2107', 'CS2105', 'MA1101R', 'MA1521', 'MA2104']);

  test('should return null if single prerequisite is met', () => {
    expect(checkPrerequisite(moduleSet, 'CS1010S')).toBeNull();
  });

  test('should return null if all prerequisites are met', () => {
    // Or operator
    expect(
      checkPrerequisite(moduleSet, {
        or: ['MA1521', 'MA1102'],
      }),
    ).toBeNull();

    // And operator
    expect(
      checkPrerequisite(moduleSet, {
        and: ['MA1521', 'MA1101R'],
      }),
    ).toBeNull();
  });

  test('should return module that are not fulfilled', () => {
    expect(checkPrerequisite(moduleSet, 'CS2030')).toEqual(['CS2030']);
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

describe(isYearLong, () => {
  test('should return false for semester-long module', () => {
    expect(isYearLong({ moduleInfo: CS1010S })).toEqual(false);
  });

  test('should return true for year-long module', () => {
    expect(isYearLong({ moduleInfo: GEQ1917 })).toEqual(true);
  });
});
