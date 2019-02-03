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

    expect(
      getAcadYearModules(
        getState({
          minYear: '2018/2019',
          maxYear: '2018/2019',
          iblocs: false,
          modules: {},
        }),
      ),
    ).toEqual({
      '2018/2019': emptyYear,
    });

    expect(
      getAcadYearModules(
        getState({
          minYear: '2016/2017',
          maxYear: '2018/2019',
          iblocs: false,
          modules: {},
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
          minYear: '2018/2019',
          maxYear: '2018/2019',
          iblocs: false,
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
          minYear: '2018/2019',
          maxYear: '2018/2019',
          iblocs: false,
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
          minYear: '2018/2019',
          maxYear: '2018/2019',
          iblocs: false,
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
      minYear: '2018/2019',
      maxYear: '2018/2019',
      iblocs: false,
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
      minYear: '2018/2019',
      maxYear: '2018/2019',
      iblocs: false,
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
      minYear: '2017/2018',
      maxYear: '2017/2018',
      iblocs: false,
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
      minYear: '2016/2017',
      maxYear: '2016/2017',
      iblocs: false,
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
      minYear: '2018/2019',
      maxYear: '2018/2019',
      iblocs: false,
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
});
