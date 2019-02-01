// @flow

import {
  ADD_PLANNER_MODULE,
  MOVE_PLANNER_MODULE,
  REMOVE_PLANNER_MODULE,
  addPlannerModule,
  movePlannerModule,
  removePlannerModule,
  setPlannerMinYear,
  SET_PLANNER_MIN_YEAR,
  SET_PLANNER_MAX_YEAR,
  setPlannerMaxYear,
  SET_PLANNER_IBLOCS,
  setPlannerIBLOCs,
} from 'actions/planner';
import type { PlannerState } from 'types/reducers';
import reducer from './planner';

const defaultState: PlannerState = {
  minYear: '2017/2018',
  maxYear: '2018/2019',
  iblocs: false,
  modules: {},
  custom: {},
};

/* eslint-disable no-useless-computed-key */

describe(SET_PLANNER_MIN_YEAR, () => {
  test('should set min year', () => {
    expect(reducer(defaultState, setPlannerMinYear('2016/2017'))).toEqual({
      minYear: '2016/2017',
      maxYear: '2018/2019',
      iblocs: false,
      modules: {},
    });
  });

  test('should set max year if min year is past it', () => {
    expect(reducer(defaultState, setPlannerMinYear('2019/2020'))).toEqual({
      minYear: '2019/2020',
      maxYear: '2019/2020',
      iblocs: false,
      modules: {},
    });
  });
});

describe(SET_PLANNER_MAX_YEAR, () => {
  test('should set max year', () => {
    expect(reducer(defaultState, setPlannerMaxYear('2020/2021'))).toEqual({
      minYear: '2017/2018',
      maxYear: '2020/2021',
      iblocs: false,
      modules: {},
    });
  });

  test('should set min year if max year is past it', () => {
    expect(reducer(defaultState, setPlannerMaxYear('2016/2017'))).toEqual({
      minYear: '2016/2017',
      maxYear: '2016/2017',
      iblocs: false,
      modules: {},
    });
  });
});

describe(SET_PLANNER_IBLOCS, () => {
  test('should set iblocs status', () => {
    expect(reducer(defaultState, setPlannerIBLOCs(true))).toEqual({
      minYear: '2017/2018',
      maxYear: '2018/2019',
      iblocs: true,
      modules: {},
    });
  });
});

describe(ADD_PLANNER_MODULE, () => {
  const initial: PlannerState = {
    ...defaultState,

    modules: { CS1010S: ['2018/2019', 1, 0] },
  };

  test('should add module to semester and year', () => {
    expect(reducer(initial, addPlannerModule('CS2030', '2018/2019', 2)).modules).toEqual({
      CS1010S: ['2018/2019', 1, 0],
      CS2030: ['2018/2019', 2, 0],
    });

    // Add module code in uppercase
    expect(reducer(initial, addPlannerModule('cs2030', '2018/2019', 2)).modules).toEqual({
      CS1010S: ['2018/2019', 1, 0],
      CS2030: ['2018/2019', 2, 0],
    });

    // Inserts new module in correct position
    expect(reducer(initial, addPlannerModule('CS2030', '2018/2019', 1)).modules).toEqual({
      CS1010S: ['2018/2019', 1, 0],
      CS2030: ['2018/2019', 1, 1],
    });
  });

  test('should not add duplicate modules', () => {
    expect(
      Object.keys(reducer(initial, addPlannerModule('CS1010S', '2018/2019', 1)).modules),
    ).toHaveLength(1);

    // Also deduplicate lowercase module codes
    expect(
      Object.keys(reducer(initial, addPlannerModule('cs1010s', '2018/2019', 1)).modules),
    ).toHaveLength(1);
  });
});

describe(MOVE_PLANNER_MODULE, () => {
  const initial: PlannerState = {
    ...defaultState,

    modules: {
      CS1010S: ['2018/2019', 1, 0],
      CS2030: ['2018/2019', 2, 0],
      CS2105: ['2018/2019', 2, 1],
    },
  };

  test('should move modules between same semester', () => {
    expect(reducer(initial, movePlannerModule('CS2105', '2018/2019', 2, 0)).modules).toEqual({
      CS1010S: ['2018/2019', 1, 0],
      CS2030: ['2018/2019', 2, 1],
      CS2105: ['2018/2019', 2, 0],
    });

    expect(
      reducer(
        {
          ...initial,
          modules: {
            CS1010S: ['2018/2019', 2, 0],
            CS2030: ['2018/2019', 2, 1],
            CS2105: ['2018/2019', 2, 2],
          },
        },
        movePlannerModule('CS2105', '2018/2019', 2, 1),
      ).modules,
    ).toEqual({
      CS1010S: ['2018/2019', 2, 0],
      CS2105: ['2018/2019', 2, 1],
      CS2030: ['2018/2019', 2, 2],
    });
  });

  test('should move module to other acad year or semester', () => {
    // Move CS2105 from sem 2 to 1
    expect(reducer(initial, movePlannerModule('CS2105', '2018/2019', 1, 0)).modules).toEqual({
      CS1010S: ['2018/2019', 1, 1],
      CS2030: ['2018/2019', 2, 0],
      CS2105: ['2018/2019', 1, 0],
    });

    expect(reducer(initial, movePlannerModule('CS1010S', '2017/2018', 2, 0)).modules).toEqual({
      CS1010S: ['2017/2018', 2, 0],
      CS2030: ['2018/2019', 2, 0],
      CS2105: ['2018/2019', 2, 1],
    });

    expect(reducer(initial, movePlannerModule('CS1010S', '2018/2019', 2, 1)).modules).toEqual({
      CS1010S: ['2018/2019', 2, 1],
      CS2030: ['2018/2019', 2, 0],
      CS2105: ['2018/2019', 2, 2],
    });
  });
});

describe(REMOVE_PLANNER_MODULE, () => {
  const initial: PlannerState = {
    ...defaultState,

    modules: { CS1010S: ['2018/2019', 1, 0] },
  };

  test('should remove the specified module', () => {
    expect(reducer(initial, removePlannerModule('CS1010S')).modules).toEqual({});
  });
});
