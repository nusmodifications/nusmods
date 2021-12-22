import {
  ADD_PLANNER_MODULE,
  MOVE_PLANNER_MODULE,
  REMOVE_PLANNER_MODULE,
  SET_PLANNER_MIN_YEAR,
  SET_PLANNER_MAX_YEAR,
  SET_PLANNER_IBLOCS,
  SET_PREREQUISITES_CHECK,
  addPlannerModule,
  movePlannerModule,
  removePlannerModule,
  setPlannerMinYear,
  setPlannerMaxYear,
  setPlannerIBLOCs,
  setPrerequisitesCheck,
} from 'actions/planner';
import { PlannerState } from 'types/reducers';
import reducer, { migrateV0toV1, nextId } from './planner';

const defaultState: PlannerState = {
  minYear: '2017/2018',
  maxYear: '2018/2019',
  iblocs: false,
  prereqsCheck: true,
  modules: {},
  custom: {},
};

describe(nextId, () => {
  const module: any = {};

  test('should produce next ID', () => {
    expect(nextId({})).toEqual('0');
    expect(nextId({ 0: module })).toEqual('1');
  });
});

describe(SET_PLANNER_MIN_YEAR, () => {
  test('should set min year', () => {
    expect(reducer(defaultState, setPlannerMinYear('2016/2017'))).toEqual({
      ...defaultState,
      minYear: '2016/2017',
      maxYear: '2018/2019',
    });
  });

  test('should set max year if min year is past it', () => {
    expect(reducer(defaultState, setPlannerMinYear('2019/2020'))).toEqual({
      ...defaultState,
      minYear: '2019/2020',
      maxYear: '2019/2020',
    });
  });
});

describe(SET_PLANNER_MAX_YEAR, () => {
  test('should set max year', () => {
    expect(reducer(defaultState, setPlannerMaxYear('2020/2021'))).toEqual({
      ...defaultState,
      minYear: '2017/2018',
      maxYear: '2020/2021',
    });
  });

  test('should set min year if max year is past it', () => {
    expect(reducer(defaultState, setPlannerMaxYear('2016/2017'))).toEqual({
      ...defaultState,
      minYear: '2016/2017',
      maxYear: '2016/2017',
    });
  });
});

describe(SET_PLANNER_IBLOCS, () => {
  test('should set iblocs status', () => {
    expect(reducer(defaultState, setPlannerIBLOCs(true))).toEqual({
      ...defaultState,
      iblocs: true,
    });
  });
});

describe(SET_PREREQUISITES_CHECK, () => {
  test('should set prereqsCheck status', () => {
    expect(reducer(defaultState, setPrerequisitesCheck(false))).toEqual({
      ...defaultState,
      prereqsCheck: false,
    });
  });
});

describe(ADD_PLANNER_MODULE, () => {
  const initial: PlannerState = {
    ...defaultState,
    modules: {
      0: { id: '0', moduleCode: 'CS1010S', year: '2018/2019', semester: 1, index: 0 },
    },
  };

  test('should add module to semester and year', () => {
    expect(
      reducer(initial, addPlannerModule('2018/2019', 2, { type: 'module', moduleCode: 'CS2030' }))
        .modules,
    ).toEqual({
      0: { id: '0', moduleCode: 'CS1010S', year: '2018/2019', semester: 1, index: 0 },
      1: { id: '1', moduleCode: 'CS2030', year: '2018/2019', semester: 2, index: 0 },
    });

    // Inserts new module in correct position
    expect(
      reducer(initial, addPlannerModule('2018/2019', 1, { type: 'module', moduleCode: 'CS2030' }))
        .modules,
    ).toEqual({
      0: { id: '0', moduleCode: 'CS1010S', year: '2018/2019', semester: 1, index: 0 },
      1: { id: '1', moduleCode: 'CS2030', year: '2018/2019', semester: 1, index: 1 },
    });
  });

  test('can insert multiple modules in order', () => {
    const insertCS1010S = addPlannerModule('2018/2019', 1, {
      type: 'module',
      moduleCode: 'CS1010S',
    });
    const insertCS1231 = addPlannerModule('2018/2019', 1, { type: 'module', moduleCode: 'CS1231' });

    expect(reducer(reducer(defaultState, insertCS1010S), insertCS1231).modules).toEqual({
      0: { id: '0', moduleCode: 'CS1010S', year: '2018/2019', semester: 1, index: 0 },
      1: { id: '1', moduleCode: 'CS1231', year: '2018/2019', semester: 1, index: 1 },
    });
  });
});

describe(MOVE_PLANNER_MODULE, () => {
  const initial: PlannerState = {
    ...defaultState,

    modules: {
      0: { id: '0', moduleCode: 'CS1010S', year: '2018/2019', semester: 1, index: 0 },
      1: { id: '1', moduleCode: 'CS2030', year: '2018/2019', semester: 2, index: 0 },
      2: { id: '2', moduleCode: 'CS2105', year: '2018/2019', semester: 2, index: 1 },
    },
  };

  test('should move modules between same semester', () => {
    expect(reducer(initial, movePlannerModule('2', '2018/2019', 2, 0)).modules).toEqual({
      0: { id: '0', moduleCode: 'CS1010S', year: '2018/2019', semester: 1, index: 0 },
      1: { id: '1', moduleCode: 'CS2030', year: '2018/2019', semester: 2, index: 1 },
      2: { id: '2', moduleCode: 'CS2105', year: '2018/2019', semester: 2, index: 0 },
    });

    expect(
      reducer(
        {
          ...defaultState,
          modules: {
            0: { id: '0', moduleCode: 'CS1010S', year: '2018/2019', semester: 2, index: 0 },
            1: { id: '1', moduleCode: 'CS2030', year: '2018/2019', semester: 2, index: 1 },
            2: { id: '2', moduleCode: 'CS2105', year: '2018/2019', semester: 2, index: 2 },
          },
        },
        movePlannerModule('2', '2018/2019', 2, 1),
      ).modules,
    ).toEqual({
      0: { id: '0', moduleCode: 'CS1010S', year: '2018/2019', semester: 2, index: 0 },
      1: { id: '1', moduleCode: 'CS2030', year: '2018/2019', semester: 2, index: 2 },
      2: { id: '2', moduleCode: 'CS2105', year: '2018/2019', semester: 2, index: 1 },
    });
  });

  test('should move module to other acad year or semester', () => {
    // Move CS2105 from sem 2 to 1
    expect(reducer(initial, movePlannerModule('2', '2018/2019', 1, 0)).modules).toEqual({
      0: { id: '0', moduleCode: 'CS1010S', year: '2018/2019', semester: 1, index: 1 },
      1: { id: '1', moduleCode: 'CS2030', year: '2018/2019', semester: 2, index: 0 },
      2: { id: '2', moduleCode: 'CS2105', year: '2018/2019', semester: 1, index: 0 },
    });

    expect(reducer(initial, movePlannerModule('0', '2017/2018', 2, 0)).modules).toEqual({
      0: { id: '0', moduleCode: 'CS1010S', year: '2017/2018', semester: 2, index: 0 },
      1: { id: '1', moduleCode: 'CS2030', year: '2018/2019', semester: 2, index: 0 },
      2: { id: '2', moduleCode: 'CS2105', year: '2018/2019', semester: 2, index: 1 },
    });

    expect(reducer(initial, movePlannerModule('0', '2018/2019', 2, 1)).modules).toEqual({
      0: { id: '0', moduleCode: 'CS1010S', year: '2018/2019', semester: 2, index: 1 },
      1: { id: '1', moduleCode: 'CS2030', year: '2018/2019', semester: 2, index: 0 },
      2: { id: '2', moduleCode: 'CS2105', year: '2018/2019', semester: 2, index: 2 },
    });
  });
});

describe(REMOVE_PLANNER_MODULE, () => {
  const initial: PlannerState = {
    ...defaultState,

    modules: {
      0: { id: '0', moduleCode: 'CS1010S', year: '2018/2019', semester: 1, index: 0 },
    },
  };

  test('should remove the specified module', () => {
    expect(reducer(initial, removePlannerModule('0')).modules).toEqual({});
  });
});

describe(migrateV0toV1, () => {
  test('should migrate old modules state to new modules state', () => {
    expect(
      migrateV0toV1({
        _persist: {} as any,
        ...defaultState,
        modules: {
          CS1010S: ['2018/2019', 1, 0],
          MA1101R: ['2018/2019', 1, 1],
          CS1231: ['2018/2019', 2, 0],
        },
      }),
    ).toHaveProperty('modules', {
      0: { id: '0', moduleCode: 'CS1010S', year: '2018/2019', semester: 1, index: 0 },
      1: { id: '1', moduleCode: 'MA1101R', year: '2018/2019', semester: 1, index: 1 },
      2: { id: '2', moduleCode: 'CS1231', year: '2018/2019', semester: 2, index: 0 },
    });
  });
});
