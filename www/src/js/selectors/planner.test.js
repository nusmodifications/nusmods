// @flow

import { getAcadYearModules } from 'selectors/planner';
import type { PlannerState } from 'types/reducers';
import type { State } from 'reducers';

/** @var Module */
import CS3216 from '__mocks__/modules/CS3216.json';

/* eslint-disable no-useless-computed-key */

describe(getAcadYearModules, () => {
  const getState = (planner: PlannerState): State =>
    ({ planner, moduleBank: { modules: {} } }: any);

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
        [1]: [{ moduleCode: 'CS1010S' }],
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
        [3]: [{ moduleCode: 'CS1010X' }],
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
        [1]: [{ moduleCode: 'MA1521' }, { moduleCode: 'CS1010S' }, { moduleCode: 'MA1101R' }],
        [2]: [],
        [3]: [],
        [4]: [],
      },
    });
  });

  test('should map iBLOCs modules', () => {
    expect(
      getAcadYearModules(
        getState({
          minYear: '2018/2019',
          maxYear: '2018/2019',
          iblocs: true,
          modules: {
            CS1010X: ['2017/2018', 3, 0],
            MA1521: ['2018/2019', 1, 0],
          },
        }),
      ),
    ).toEqual({
      '2017/2018': {
        // iBlOCs only happen in special term, so we don't show sem 1 and 2
        [3]: [{ moduleCode: 'CS1010X' }],
        [4]: [],
      },
      '2018/2019': {
        [1]: [{ moduleCode: 'MA1521' }],
        [2]: [],
        [3]: [],
        [4]: [],
      },
    });
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
    };

    const state: any = {
      planner,
      moduleBank,
    };

    expect(getAcadYearModules(state)).toHaveProperty('2018/2019.2.0', {
      moduleCode: 'CS3216',
      moduleInfo: CS3216,
      conflicts: null,
    });
  });
});
