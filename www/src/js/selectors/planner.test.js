// @flow

import { clone } from 'lodash';
import { getAcadYearModules, getPrereqModuleCode } from 'selectors/planner';
import type { PlannerState } from 'types/reducers';
import type { State } from 'reducers';
import type { ModuleCode } from 'types/modules';

/** @var Module */
import CS3216 from '__mocks__/modules/CS3216.json';
/** @var Module */
import CS1010S from '__mocks__/modules/CS1010S.json';

// Stupid trick to get two modules with the same exam dates
const CS1010X = clone(CS1010S);
CS1010X.ModuleCode = 'CS1010X';

/* eslint-disable no-useless-computed-key */

const defaultState: PlannerState = {
  minYear: '2018/2019',
  maxYear: '2018/2019',
  iblocs: false,
  modules: {},
  custom: {},
};

describe(getPrereqModuleCode, () => {
  test('should return both original and variant module codes', () => {
    expect(getPrereqModuleCode('CS1010')).toEqual(['CS1010']);
    expect(getPrereqModuleCode('CS1010X')).toEqual(['CS1010X', 'CS1010']);
  });
});

describe(getAcadYearModules, () => {
  const getState = (planner: PlannerState): State =>
    ({
      planner,
      moduleBank: {
        modules: {},
        moduleCodes: {},
      },
    }: any);

  const expectModuleCodes = (modules: ModuleCode[]) =>
    modules.map((moduleCode) =>
      // This lets us ignore conflicts
      expect.objectContaining({ moduleCode }),
    );

  test('should add semesters for empty years', () => {
    const emptyYear = {
      [1]: [],
      [2]: [],
      [3]: [],
      [4]: [],
    };

    expect(getAcadYearModules(getState(defaultState))).toEqual({
      '2018/2019': emptyYear,
    });

    expect(
      getAcadYearModules(
        getState({
          ...defaultState,
          minYear: '2016/2017',
          maxYear: '2018/2019',
        }),
      ),
    ).toEqual({
      '2016/2017': emptyYear,
      '2017/2018': emptyYear,
      '2018/2019': emptyYear,
    });
  });

  test('should map modules to years and semesters', () => {
    expect(
      getAcadYearModules(
        getState({
          ...defaultState,
          modules: {
            CS1010S: ['2018/2019', 1, 0],
          },
        }),
      ),
    ).toEqual({
      '2018/2019': {
        [1]: expectModuleCodes(['CS1010S']),
        [2]: [],
        [3]: [],
        [4]: [],
      },
    });

    expect(
      getAcadYearModules(
        getState({
          ...defaultState,
          modules: {
            CS1010X: ['2018/2019', 3, 0],
          },
        }),
      ),
    ).toEqual({
      '2018/2019': {
        [1]: [],
        [2]: [],
        [3]: expectModuleCodes(['CS1010X']),
        [4]: [],
      },
    });
  });

  test('should map modules in the correct order', () => {
    expect(
      getAcadYearModules(
        getState({
          ...defaultState,
          modules: {
            CS1010S: ['2018/2019', 1, 1],
            MA1521: ['2018/2019', 1, 0],
            MA1101R: ['2018/2019', 1, 2],
          },
        }),
      ),
    ).toEqual({
      '2018/2019': {
        [1]: expectModuleCodes(['MA1521', 'CS1010S', 'MA1101R']),
        [2]: [],
        [3]: [],
        [4]: [],
      },
    });
  });

  test('should return semester conflicts', () => {
    const planner: PlannerState = {
      ...defaultState,
      modules: {
        // CS3216 is not offered in sem 2
        CS3216: ['2018/2019', 2, 0],
      },
    };

    const moduleBank = {
      modules: {},
      moduleCodes: { CS3216: { Semesters: [1] } },
    };

    const state: any = { planner, moduleBank };

    expect(getAcadYearModules(state)).toHaveProperty('2018/2019.2.0', {
      moduleCode: 'CS3216',
      conflict: { type: 'semester', semestersOffered: [1] },
    });
  });

  test('should return module prereq conflicts', () => {
    const planner: PlannerState = {
      ...defaultState,
      modules: {
        // CS3216 requires CS2103
        CS3216: ['2018/2019', 1, 0],
      },
    };

    const moduleBank = {
      modules: { CS3216 },
      moduleCodes: { CS3216: { Semesters: [1] } },
    };

    const state: any = { planner, moduleBank };

    expect(getAcadYearModules(state)).toHaveProperty('2018/2019.1.0', {
      moduleCode: 'CS3216',
      moduleInfo: CS3216,
      conflict: {
        type: 'prereq',
        unfulfilledPrereqs: [{ name: 'CS2103', children: [] }],
      },
    });
  });

  test('should return semester exam conflicts', () => {
    const planner: PlannerState = {
      ...defaultState,
      maxYear: '2017/2018',
      minYear: '2017/2018',
      modules: {
        // config.academicYear is mocked to '2017/2018'
        CS1010X: ['2017/2018', 1, 0],
        CS1010S: ['2017/2018', 1, 1],
      },
    };

    const moduleBank = {
      modules: { CS1010S, CS1010X },
      moduleCodes: {
        CS1010S: { Semesters: [1] },
        CS1010X: { Semesters: [1] },
      },
    };

    const state: any = { planner, moduleBank };

    expect(getAcadYearModules(state)).toHaveProperty('2017/2018.1', [
      {
        moduleCode: 'CS1010X',
        moduleInfo: CS1010X,
        conflict: {
          type: 'exam',
          conflictModules: ['CS1010X', 'CS1010S'],
        },
      },
      {
        moduleCode: 'CS1010S',
        moduleInfo: CS1010S,
        conflict: {
          type: 'exam',
          conflictModules: ['CS1010X', 'CS1010S'],
        },
      },
    ]);
  });

  test('should not show exam conflicts for modules not taken this year', () => {
    const planner: PlannerState = {
      ...defaultState,
      minYear: '2016/2017',
      maxYear: '2016/2017',
      modules: {
        // config.academicYear is mocked to '2017/2018'
        CS1010X: ['2016/2017', 1, 0],
        CS1010S: ['2016/2017', 1, 1],
      },
    };

    const moduleBank = {
      modules: { CS1010S, CS1010X },
      moduleCodes: {
        CS1010S: { Semesters: [1] },
        CS1010X: { Semesters: [1] },
      },
    };

    const state: any = { planner, moduleBank };

    expect(getAcadYearModules(state)).toHaveProperty('2016/2017.1', [
      {
        moduleCode: 'CS1010X',
        moduleInfo: CS1010X,
        conflict: null,
      },
      {
        moduleCode: 'CS1010S',
        moduleInfo: CS1010S,
        conflict: null,
      },
    ]);
  });

  // Allow variants to fulfill prereqs eg. CS1010S should fulfill CS1010
  // This is a heuristic - not all variants are equal, but it should work
  // in most cases
  test('should allow variants to serve as prereqs', () => {
    const planner: PlannerState = {
      ...defaultState,
      modules: {
        // CS3216 requires CS2103, but we have CS2103T
        CS2103T: ['2018/2019', 1, 0],
        CS3216: ['2018/2019', 2, 0],
      },
    };

    const moduleBank = {
      modules: {
        CS3216,
      },
      moduleCodes: {
        CS2103T: { Semesters: [1, 2] },
        CS3216: { Semesters: [1, 2] },
      },
    };

    const state: any = {
      planner,
      moduleBank,
    };

    expect(getAcadYearModules(state)).toHaveProperty('2018/2019.2.0', {
      moduleCode: 'CS3216',
      moduleInfo: CS3216,
      conflict: null,
    });
  });

  test('should include custom data from the user', () => {
    // CS2020 uses custom info, while CS3216 uses module bank info
    const planner: PlannerState = {
      ...defaultState,
      modules: {
        CS2020: ['2018/2019', 1, 0],
        CS3216: ['2018/2019', 1, 1],
      },
      custom: {
        CS2020: {
          title: 'Algorithms and Data Structure Accelerated',
          moduleCredit: 6,
        },
      },
    };

    const moduleBank = {
      modules: {
        CS3216,
      },
      moduleCodes: {
        CS2020: { Semesters: [1] },
        CS3216: { Semesters: [1] },
      },
    };

    const state: any = {
      planner,
      moduleBank,
    };

    const result = getAcadYearModules(state);
    const [cs2020, cs3216] = result['2018/2019'][1];

    expect(cs2020).toMatchObject({
      moduleCode: 'CS2020',
      customInfo: {
        title: 'Algorithms and Data Structure Accelerated',
        moduleCredit: 6,
      },
      conflict: null,
    });

    expect(cs3216).toMatchObject({
      moduleCode: 'CS3216',
      moduleInfo: CS3216,
      // There will be a prereq not fulfilled conflict, but we're not testing for that
    });
  });

  test('should show no data conflicts for modules with no info in the module bank', () => {
    const state = getState({
      ...defaultState,
      modules: {
        CS2020: ['2018/2019', 1, 0],
      },
    });

    expect(getAcadYearModules(state)).toHaveProperty('2018/2019.1.0.conflict', {
      type: 'noInfo',
    });
  });

  test('should not show no data conflicts for modules with custom info', () => {
    const state = getState({
      ...defaultState,
      modules: {
        CS2020: ['2018/2019', 1, 0],
      },
      custom: {
        CS2020: {
          title: 'Algorithms and Data Structure Accelerated',
          moduleCredit: 6,
        },
      },
    });

    expect(getAcadYearModules(state)).toHaveProperty('2018/2019.1.0.conflict', null);
  });
});
