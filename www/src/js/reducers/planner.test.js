// @flow

import {
  ADD_PLANNER_MODULE,
  ADD_PLANNER_YEAR,
  MOVE_PLANNER_MODULE,
  REMOVE_PLANNER_MODULE,
  addPlannerModule,
  addPlannerYear,
  movePlannerModule,
  removePlannerModule,
} from 'actions/planner';
import type { PlannerState } from 'types/reducers';
import reducer from './planner';

/* eslint-disable no-useless-computed-key */

describe(ADD_PLANNER_YEAR, () => {
  const initial: PlannerState = {
    minYear: '2017/2018',
    maxYear: '2018/2019',
    modules: {},
  };

  test('should not do anything if year already exists', () => {
    expect(reducer(initial, addPlannerYear('2018/2019'))).toEqual(initial);
  });

  test('should add year with empty semesters', () => {
    expect(reducer(initial, addPlannerYear('2019/2020'))).toEqual({
      minYear: '2017/2018',
      maxYear: '2019/2020',
      modules: {},
    });

    expect(reducer(initial, addPlannerYear('2016/2017'))).toEqual({
      minYear: '2016/2017',
      maxYear: '2018/2019',
      modules: {},
    });
  });
});

describe(ADD_PLANNER_MODULE, () => {
  const initial: PlannerState = {
    minYear: '2017/2018',
    maxYear: '2018/2019',
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
    minYear: '2017/2018',
    maxYear: '2018/2019',
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
    minYear: '2017/2018',
    maxYear: '2018/2019',
    modules: { CS1010S: ['2018/2019', 1, 0] },
  };

  test('should remove the specified module', () => {
    expect(reducer(initial, removePlannerModule('CS1010S')).modules).toEqual({});
  });
});
