import { CohortRule, PrereqTree, Semester } from 'types/modules';
import { Conflict, DuplicateConflict, PrereqConflict } from 'types/planner';
import { CS1010S } from '__mocks__/modules';

import {
  acadYearLabel,
  checkPrerequisite,
  conflictToText,
  fromDroppableId,
  getConflictToDisplay,
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

  describe('cohort-gated requirements', () => {
    const gate = (
      years: string[],
      then: PrereqTree = 'LC1016:D',
      rule: CohortRule = 'IF_IN',
    ): PrereqTree => ({ cohort: { rule, years }, then });

    test('enforces the requirement when the cohort matches (S: lower bound)', () => {
      expect(checkPrerequisite(moduleSet, gate(['S:2022']), 2022)).toEqual(['LC1016:D']);
    });

    test('skips the requirement when the cohort is outside the range', () => {
      // Matriculated 2020, requirement only applies from cohort 2022 onwards.
      expect(checkPrerequisite(moduleSet, gate(['S:2022']), 2020)).toHaveLength(0);
    });

    test('conservatively enforces when the cohort year is unknown', () => {
      expect(checkPrerequisite(moduleSet, gate(['S:2022']))).toEqual(['LC1016:D']);
    });

    test('treats E: as an upper bound (cohorts up to and including)', () => {
      expect(checkPrerequisite(moduleSet, gate(['E:2019']), 2018)).toEqual(['LC1016:D']);
      expect(checkPrerequisite(moduleSet, gate(['E:2019']), 2022)).toHaveLength(0);
    });

    test('treats two tokens as a closed range, parsing academic-year tokens', () => {
      const range = gate(['S:2020/21', 'E:2022/23']);
      expect(checkPrerequisite(moduleSet, range, 2021)).toEqual(['LC1016:D']);
      expect(checkPrerequisite(moduleSet, range, 2024)).toHaveLength(0);
    });

    test('inverts the match for IF_NOT_IN', () => {
      expect(checkPrerequisite(moduleSet, gate(['S:2022'], 'LC1016:D', 'IF_NOT_IN'), 2020)).toEqual(
        ['LC1016:D'],
      );
      expect(
        checkPrerequisite(moduleSet, gate(['S:2022'], 'LC1016:D', 'IF_NOT_IN'), 2022),
      ).toHaveLength(0);
    });

    test('reports the gated requirement as fulfilled when it is met', () => {
      // moduleSet contains NTW2006, fulfilling the NTW% wildcard.
      expect(checkPrerequisite(moduleSet, gate(['S:2020'], 'NTW%'), 2022)).toHaveLength(0);
    });

    describe('bare cohort constraint (no `then`)', () => {
      const constraint: PrereqTree = { cohort: { rule: 'MUST_BE_IN', years: ['S:2017'] } };

      test('is satisfied when the matriculation year matches', () => {
        expect(checkPrerequisite(moduleSet, constraint, 2018)).toHaveLength(0);
      });

      test('is unfulfilled when the matriculation year does not match', () => {
        expect(checkPrerequisite(moduleSet, constraint, 2016)).toEqual([constraint]);
      });

      test('is conservatively satisfied when the cohort year is unknown', () => {
        expect(checkPrerequisite(moduleSet, constraint)).toHaveLength(0);
      });

      test('surfaces as a conflict alongside an unmet course requirement', () => {
        // The DBA3702 shape: one of the courses AND a cohort constraint.
        const tree: PrereqTree = {
          and: [{ or: ['CS9999'] }, constraint],
        };
        expect(checkPrerequisite(moduleSet, tree, 2016)).toEqual([{ or: ['CS9999'] }, constraint]);
      });
    });
  });

  describe('program-type-gated requirements', () => {
    // The gated course (CS9999) is not in moduleSet, so the requirement is unmet
    // whenever it is enforced.
    const gradGate: PrereqTree = {
      programType: { rule: 'IF_IN', types: ['Graduate Degree Coursework'] },
      then: 'CS9999',
    };

    test('enforces the requirement for a student in the gated program type', () => {
      expect(checkPrerequisite(moduleSet, gradGate, undefined, 'Graduate')).toEqual(['CS9999']);
    });

    test('skips the requirement for a student not in the gated program type', () => {
      expect(checkPrerequisite(moduleSet, gradGate, undefined, 'Undergraduate')).toHaveLength(0);
    });

    test('maps Graduate to both graduate program types', () => {
      const researchGate: PrereqTree = {
        programType: { rule: 'IF_IN', types: ['Graduate Degree Research'] },
        then: 'CS9999',
      };
      expect(checkPrerequisite(moduleSet, researchGate, undefined, 'Graduate')).toEqual(['CS9999']);
    });

    test('a CPE-only gate applies to neither schedule type', () => {
      const cpeGate: PrereqTree = {
        programType: { rule: 'IF_IN', types: ['CPE (Certificate)'] },
        then: 'CS9999',
      };
      expect(checkPrerequisite(moduleSet, cpeGate, undefined, 'Undergraduate')).toHaveLength(0);
      expect(checkPrerequisite(moduleSet, cpeGate, undefined, 'Graduate')).toHaveLength(0);
    });

    test('conservatively enforces when the schedule type is unknown', () => {
      expect(checkPrerequisite(moduleSet, gradGate)).toEqual(['CS9999']);
    });

    test('enforces only the branch matching the schedule type in an OR', () => {
      // The differing-degree shape, e.g. MA5202: each branch gated by program
      // type. Only the branch matching the student is enforced; the others are
      // removed rather than vacuously satisfying the OR.
      const tree: PrereqTree = {
        or: [
          { programType: { rule: 'IF_IN', types: ['Undergraduate Degree'] }, then: 'CS1010S' },
          gradGate,
        ],
      };
      // Undergraduate: only the UG branch applies; CS1010S is present -> satisfied.
      expect(checkPrerequisite(moduleSet, tree, undefined, 'Undergraduate')).toHaveLength(0);
      // Graduate: only the grad branch applies; CS9999 is missing -> unfulfilled.
      expect(checkPrerequisite(moduleSet, tree, undefined, 'Graduate')).toEqual(['CS9999']);
    });
  });
});

describe(conflictToText, () => {
  test('should describe single modules', () => {
    expect(conflictToText('CS1010S')).toEqual('CS1010S');
  });

  test('describes the gated requirement of a cohort node', () => {
    expect(
      conflictToText({
        cohort: { rule: 'IF_IN', years: ['S:2022'] },
        then: { or: ['CS1010:D', 'CS1101S:D'] },
      }),
    ).toEqual('CS1010 or CS1101S');
  });

  test('describes a bare cohort constraint', () => {
    expect(conflictToText({ cohort: { rule: 'MUST_BE_IN', years: ['S:2017'] } })).toEqual(
      'cohort 2017 onwards',
    );
  });

  test('describes the gated requirement of a program-type node', () => {
    expect(
      conflictToText({
        programType: { rule: 'IF_IN', types: ['Graduate Degree Coursework'] },
        then: { or: ['CS1010:D', 'CS1101S:D'] },
      }),
    ).toEqual('CS1010 or CS1101S');
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

describe('getConflictToDisplay', () => {
  test('returns null when no conflicts', () => {
    expect(getConflictToDisplay([], true)).toBeNull();
    expect(getConflictToDisplay([], false)).toBeNull();
  });

  test('shows the first conflict for current year', () => {
    const conflicts: Conflict[] = [
      {
        type: 'semester',
        semestersOffered: [],
      },
    ];

    const result = getConflictToDisplay(conflicts, true);
    expect(result).toEqual(conflicts[0]);
  });

  test('returns prereq conflict for non-current year if present', () => {
    const prereqConflict: PrereqConflict = {
      type: 'prereq',
      unfulfilledPrereqs: [],
    };

    const conflicts: Conflict[] = [{ type: 'semester', semestersOffered: [] }, prereqConflict];

    const result = getConflictToDisplay(conflicts, false);
    expect(result).toEqual(prereqConflict);
  });

  test('returns duplicate conflict for non-current year if no prereq exists', () => {
    const duplicateConflict: DuplicateConflict = {
      type: 'duplicate',
    };

    const conflicts: Conflict[] = [{ type: 'semester', semestersOffered: [] }, duplicateConflict];

    const result = getConflictToDisplay(conflicts, false);
    expect(result).toEqual(duplicateConflict);
  });

  test('returns null for non-current year if no prereq or duplicate conflicts exist', () => {
    const conflicts: Conflict[] = [
      { type: 'semester', semestersOffered: [] },
      { type: 'exam', conflictModules: [] },
    ];

    const result = getConflictToDisplay(conflicts, false);
    expect(result).toBeNull();
  });
});
