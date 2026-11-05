import { Programme, ProgrammeFulfilment } from 'types/programmes';

import {
  checkProgramme,
  moduleMatchesMatcher,
  moduleMatchesRequirement,
  ProgrammeModule,
} from 'utils/programmes';

const mc4 = (moduleCode: string): ProgrammeModule => ({ moduleCode, moduleCredit: 4 });

function makeProgramme(overrides: Partial<Programme>): Programme {
  return {
    id: 'test-programme',
    name: 'Test Programme',
    type: 'minor',
    faculty: 'Test Faculty',
    requirements: [],
    source: 'https://example.com',
    lastVerified: '2026-07-09',
    ...overrides,
  };
}

function fulfilmentByRequirement(fulfilment: ProgrammeFulfilment, id: string) {
  const requirement = fulfilment.requirements.find((r) => r.requirement.id === id);
  if (!requirement) throw new Error(`No requirement ${id}`);
  return requirement;
}

describe(moduleMatchesMatcher, () => {
  test('should match explicit module codes', () => {
    const matcher = { kind: 'modules', codes: ['CS1010', 'CS1101S'] } as const;

    expect(moduleMatchesMatcher('CS1010', matcher)).toBe(true);
    expect(moduleMatchesMatcher('CS1101S', matcher)).toBe(true);
    expect(moduleMatchesMatcher('CS1010S', matcher)).toBe(false);
  });

  test('should match prefixes with level bounds', () => {
    const matcher = { kind: 'prefix', prefixes: ['CS'], minLevel: 3000, maxLevel: 4999 } as const;

    expect(moduleMatchesMatcher('CS3230', matcher)).toBe(true);
    expect(moduleMatchesMatcher('CS4248', matcher)).toBe(true);
    // Modules with a suffix still have a numeric level
    expect(moduleMatchesMatcher('CS3216R', matcher)).toBe(true);
    expect(moduleMatchesMatcher('CS2030', matcher)).toBe(false);
    expect(moduleMatchesMatcher('CS5228', matcher)).toBe(false);
    expect(moduleMatchesMatcher('MA3110', matcher)).toBe(false);
    // Prefix must match the full department code, not a substring of it
    expect(moduleMatchesMatcher('CSA3001', matcher)).toBe(false);
  });

  test('should match prefixes without level bounds', () => {
    const matcher = { kind: 'prefix', prefixes: ['MA', 'ST'] } as const;

    expect(moduleMatchesMatcher('MA1100', matcher)).toBe(true);
    expect(moduleMatchesMatcher('ST2131', matcher)).toBe(true);
    expect(moduleMatchesMatcher('CS1010', matcher)).toBe(false);
  });
});

describe(moduleMatchesRequirement, () => {
  test('should match if any matcher matches', () => {
    const requirement = {
      id: 'req',
      name: 'Requirement',
      matchers: [
        { kind: 'modules', codes: ['GEA1000'] } as const,
        { kind: 'prefix', prefixes: ['CS'], minLevel: 3000 } as const,
      ],
    };

    expect(moduleMatchesRequirement('GEA1000', requirement)).toBe(true);
    expect(moduleMatchesRequirement('CS3230', requirement)).toBe(true);
    expect(moduleMatchesRequirement('CS1010', requirement)).toBe(false);
  });
});

describe(checkProgramme, () => {
  const programme = makeProgramme({
    totalMCs: 12,
    requirements: [
      {
        id: 'core',
        name: 'Core',
        minModules: 1,
        matchers: [{ kind: 'modules', codes: ['AA1000', 'AA1001'] }],
      },
      {
        id: 'advanced',
        name: 'Advanced',
        minMCs: 8,
        matchers: [{ kind: 'prefix', prefixes: ['AA'], minLevel: 4000 }],
      },
    ],
  });

  test('should report nothing fulfilled for an empty plan', () => {
    const fulfilment = checkProgramme([], programme);

    expect(fulfilment.satisfied).toBe(false);
    expect(fulfilment.totalMCs).toBe(0);
    expect(fulfilmentByRequirement(fulfilment, 'core').satisfied).toBe(false);
    expect(fulfilmentByRequirement(fulfilment, 'advanced').assignedModules).toEqual([]);
  });

  test('should satisfy a programme when all requirements are met', () => {
    const fulfilment = checkProgramme(
      [mc4('AA1000'), mc4('AA4000'), mc4('AA4001'), mc4('ZZ1000')],
      programme,
    );

    expect(fulfilment.satisfied).toBe(true);
    expect(fulfilment.totalMCs).toBe(12);
    expect(fulfilmentByRequirement(fulfilment, 'core').assignedModules).toEqual(['AA1000']);
    expect(fulfilmentByRequirement(fulfilment, 'advanced').fulfilledMCs).toBe(8);
  });

  test('should not double count one module towards two requirements', () => {
    const overlapping = makeProgramme({
      requirements: [
        {
          id: 'first',
          name: 'First',
          minModules: 1,
          matchers: [{ kind: 'modules', codes: ['AA1000'] }],
        },
        {
          id: 'second',
          name: 'Second',
          minModules: 1,
          matchers: [{ kind: 'modules', codes: ['AA1000', 'AA1001'] }],
        },
      ],
    });

    const partial = checkProgramme([mc4('AA1000')], overlapping);
    expect(partial.satisfied).toBe(false);
    expect(partial.totalMCs).toBe(4);

    const full = checkProgramme([mc4('AA1000'), mc4('AA1001')], overlapping);
    expect(full.satisfied).toBe(true);
    expect(fulfilmentByRequirement(full, 'first').assignedModules).toEqual(['AA1000']);
    expect(fulfilmentByRequirement(full, 'second').assignedModules).toEqual(['AA1001']);
  });

  test('should reassign modules when a naive greedy assignment fails', () => {
    // AA1000 is assigned to 'broad' first, then must move to 'narrow' when
    // AA1001 arrives and only fits 'broad'
    const needsAugmenting = makeProgramme({
      requirements: [
        {
          id: 'broad',
          name: 'Broad',
          minModules: 1,
          matchers: [{ kind: 'modules', codes: ['AA1000', 'AA1001'] }],
        },
        {
          id: 'narrow',
          name: 'Narrow',
          minModules: 1,
          matchers: [{ kind: 'modules', codes: ['AA1000'] }],
        },
      ],
    });

    const fulfilment = checkProgramme([mc4('AA1000'), mc4('AA1001')], needsAugmenting);

    expect(fulfilment.satisfied).toBe(true);
    expect(fulfilmentByRequirement(fulfilment, 'narrow').assignedModules).toEqual(['AA1000']);
    expect(fulfilmentByRequirement(fulfilment, 'broad').assignedModules).toEqual(['AA1001']);
  });

  test('should model focus area style requirements', () => {
    // 3 primaries with at least one at level-4000, expressed as 1 + 2
    const focusArea = makeProgramme({
      requirements: [
        {
          id: 'primaries-4000',
          name: 'One level-4000 Area Primary',
          minModules: 1,
          matchers: [{ kind: 'modules', codes: ['AA4000', 'AA4001'] }],
        },
        {
          id: 'primaries',
          name: 'Two other Area Primaries',
          minModules: 2,
          matchers: [{ kind: 'modules', codes: ['AA3000', 'AA3001', 'AA4000', 'AA4001'] }],
        },
      ],
    });

    // No level-4000 primary
    expect(checkProgramme([mc4('AA3000'), mc4('AA3001')], focusArea).satisfied).toBe(false);

    // All three at level-4000: one routes to primaries-4000, two to primaries
    expect(checkProgramme([mc4('AA4000'), mc4('AA4001'), mc4('AA3000')], focusArea).satisfied).toBe(
      true,
    );
  });

  test('should top up MC floors when low MC modules fill all slots', () => {
    const mcFloor = makeProgramme({
      requirements: [
        {
          id: 'floor',
          name: 'MC floor',
          minMCs: 8,
          matchers: [{ kind: 'prefix', prefixes: ['AA'] }],
        },
      ],
    });

    const twoMC = (code: string): ProgrammeModule => ({ moduleCode: code, moduleCredit: 2 });
    const fulfilment = checkProgramme(
      [twoMC('AA1000'), twoMC('AA1001'), twoMC('AA1002'), twoMC('AA1003')],
      mcFloor,
    );

    expect(fulfilmentByRequirement(fulfilment, 'floor').fulfilledMCs).toBe(8);
    expect(fulfilment.satisfied).toBe(true);
  });

  test('should count elective pool modules towards total MCs only', () => {
    const withPool = makeProgramme({
      requirements: [
        {
          id: 'core',
          name: 'Core',
          minModules: 1,
          matchers: [{ kind: 'modules', codes: ['AA1000'] }],
        },
        {
          id: 'electives',
          name: 'Electives',
          matchers: [{ kind: 'modules', codes: ['BB2000'] }],
        },
      ],
    });

    const fulfilment = checkProgramme([mc4('AA1000'), mc4('BB2000'), mc4('ZZ1000')], withPool);

    expect(fulfilmentByRequirement(fulfilment, 'electives').satisfied).toBe(true);
    expect(fulfilmentByRequirement(fulfilment, 'electives').assignedModules).toEqual(['BB2000']);
    // ZZ1000 matches nothing so only AA1000 and BB2000 count
    expect(fulfilment.totalMCs).toBe(8);
    expect(fulfilment.satisfied).toBe(true);
  });

  test('should count duplicated module codes once', () => {
    const fulfilment = checkProgramme([mc4('AA1000'), mc4('AA1000')], programme);

    expect(fulfilmentByRequirement(fulfilment, 'core').assignedModules).toEqual(['AA1000']);
    expect(fulfilment.totalMCs).toBe(4);
  });

  test('should not satisfy the programme if the total MC floor is unmet', () => {
    const highTotal = makeProgramme({
      totalMCs: 8,
      requirements: [
        {
          id: 'core',
          name: 'Core',
          minModules: 1,
          matchers: [{ kind: 'modules', codes: ['AA1000'] }],
        },
      ],
    });

    const fulfilment = checkProgramme([mc4('AA1000')], highTotal);

    expect(fulfilmentByRequirement(fulfilment, 'core').satisfied).toBe(true);
    expect(fulfilment.satisfied).toBe(false);
  });

  test('should assign surplus matching modules so their MCs count', () => {
    const fulfilment = checkProgramme(
      [mc4('AA1000'), mc4('AA1001'), mc4('AA4000'), mc4('AA4001'), mc4('AA4002')],
      programme,
    );

    // core needs 1, advanced needs 8 MCs; all 5 modules match something
    expect(fulfilment.totalMCs).toBe(20);
    expect(fulfilment.satisfied).toBe(true);
  });
});
