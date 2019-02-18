import {
  addModule,
  moveModule,
  removeModule,
  setMinYear,
  setMaxYear,
  setIBLOCs,
} from 'actions/planner';
import { PlannerState } from 'types/reducers';
import reducer from './planner';

const defaultState: PlannerState = {
  minYear: '2017/2018',
  maxYear: '2018/2019',
  iblocs: false,
  modules: {},
  custom: {},
};

/* eslint-disable no-useless-computed-key */

describe(setMinYear, () => {
  test('should set min year', () => {
    expect(reducer(defaultState, setMinYear('2016/2017'))).toEqual({
      ...defaultState,
      minYear: '2016/2017',
      maxYear: '2018/2019',
    });
  });

  test('should set max year if min year is past it', () => {
    expect(reducer(defaultState, setMinYear('2019/2020'))).toEqual({
      ...defaultState,
      minYear: '2019/2020',
      maxYear: '2019/2020',
    });
  });
});

describe(setMaxYear, () => {
  test('should set max year', () => {
    expect(reducer(defaultState, setMaxYear('2020/2021'))).toEqual({
      ...defaultState,
      minYear: '2017/2018',
      maxYear: '2020/2021',
    });
  });

  test('should set min year if max year is past it', () => {
    expect(reducer(defaultState, setMaxYear('2016/2017'))).toEqual({
      ...defaultState,
      minYear: '2016/2017',
      maxYear: '2016/2017',
    });
  });
});

describe(setIBLOCs, () => {
  test('should set iblocs status', () => {
    expect(reducer(defaultState, setIBLOCs(true))).toEqual({
      ...defaultState,
      iblocs: true,
    });
  });
});

describe(addModule, () => {
  const initial: PlannerState = {
    ...defaultState,
    modules: { CS1010S: ['2018/2019', 1, 0] },
  };

  test('should add module to semester and year', () => {
    expect(
      reducer(initial, addModule({ moduleCode: 'CS2030', year: '2018/2019', semester: 2 })).modules,
    ).toEqual({
      CS1010S: ['2018/2019', 1, 0],
      CS2030: ['2018/2019', 2, 0],
    });

    // Add module code in uppercase
    expect(
      reducer(initial, addModule({ moduleCode: 'cs2030', year: '2018/2019', semester: 2 })).modules,
    ).toEqual({
      CS1010S: ['2018/2019', 1, 0],
      CS2030: ['2018/2019', 2, 0],
    });

    // Inserts new module in correct position
    expect(
      reducer(initial, addModule({ moduleCode: 'CS2030', year: '2018/2019', semester: 1 })).modules,
    ).toEqual({
      CS1010S: ['2018/2019', 1, 0],
      CS2030: ['2018/2019', 1, 1],
    });
  });

  test('should not add duplicate modules', () => {
    expect(
      Object.keys(
        reducer(initial, addModule({ moduleCode: 'CS1010S', year: '2018/2019', semester: 1 }))
          .modules,
      ),
    ).toHaveLength(1);

    // Also deduplicate lowercase module codes
    expect(
      Object.keys(
        reducer(initial, addModule({ moduleCode: 'cs1010s', year: '2018/2019', semester: 1 }))
          .modules,
      ),
    ).toHaveLength(1);
  });
});

describe(moveModule, () => {
  const initial: PlannerState = {
    ...defaultState,

    modules: {
      CS1010S: ['2018/2019', 1, 0],
      CS2030: ['2018/2019', 2, 0],
      CS2105: ['2018/2019', 2, 1],
    },
  };

  test('should move modules between same semester', () => {
    expect(
      reducer(
        initial,
        moveModule({ moduleCode: 'CS2105', year: '2018/2019', semester: 2, index: 0 }),
      ).modules,
    ).toEqual({
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
        moveModule({ moduleCode: 'CS2105', year: '2018/2019', semester: 2, index: 1 }),
      ).modules,
    ).toEqual({
      CS1010S: ['2018/2019', 2, 0],
      CS2105: ['2018/2019', 2, 1],
      CS2030: ['2018/2019', 2, 2],
    });
  });

  test('should move module to other acad year or semester', () => {
    // Move CS2105 from sem 2 to 1
    expect(
      reducer(
        initial,
        moveModule({ moduleCode: 'CS2105', year: '2018/2019', semester: 1, index: 0 }),
      ).modules,
    ).toEqual({
      CS1010S: ['2018/2019', 1, 1],
      CS2030: ['2018/2019', 2, 0],
      CS2105: ['2018/2019', 1, 0],
    });

    expect(
      reducer(
        initial,
        moveModule({ moduleCode: 'CS1010S', year: '2017/2018', semester: 2, index: 0 }),
      ).modules,
    ).toEqual({
      CS1010S: ['2017/2018', 2, 0],
      CS2030: ['2018/2019', 2, 0],
      CS2105: ['2018/2019', 2, 1],
    });

    expect(
      reducer(
        initial,
        moveModule({ moduleCode: 'CS1010S', year: '2018/2019', semester: 2, index: 1 }),
      ).modules,
    ).toEqual({
      CS1010S: ['2018/2019', 2, 1],
      CS2030: ['2018/2019', 2, 0],
      CS2105: ['2018/2019', 2, 2],
    });
  });
});

describe(removeModule, () => {
  const initial: PlannerState = {
    ...defaultState,

    modules: { CS1010S: ['2018/2019', 1, 0] },
  };

  test('should remove the specified module', () => {
    expect(reducer(initial, removeModule({ moduleCode: 'CS1010S' })).modules).toEqual({});
  });
});
