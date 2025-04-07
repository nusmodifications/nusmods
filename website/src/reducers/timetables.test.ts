import { PersistConfig } from 'redux-persist/es/types';
import reducer, { defaultTimetableState, persistConfig } from 'reducers/timetables';
import {
  ADD_MODULE,
  hideLessonInTimetable,
  removeModule,
  SET_TIMETABLE,
  setLessonConfig,
  showLessonInTimetable,
  setHiddenImported,
  Internal,
  addTaLessonInTimetable,
  removeTaLessonInTimetable,
} from 'actions/timetables';
import { TimetablesState } from 'types/reducers';
import config from 'config';

const initialState = defaultTimetableState;

jest.mock('config');

/* eslint-disable no-useless-computed-key */
describe('color reducers', () => {
  test('should add colors when modules are added', () => {
    expect(
      reducer(initialState, {
        type: ADD_MODULE,
        payload: {
          semester: 1,
          moduleCode: 'CS1010S',
          moduleLessonConfig: {},
        },
      }).colors,
    ).toHaveProperty('1.CS1010S');

    expect(
      reducer(initialState, {
        type: ADD_MODULE,
        payload: {
          semester: 2,
          moduleCode: 'CS3216',
          moduleLessonConfig: {},
        },
      }).colors,
    ).toHaveProperty('2.CS3216');
  });

  test('should remove colors when modules are removed', () => {
    const state = {
      ...initialState,
      colors: {
        [1]: { CS1010S: 1, CS3216: 0 },
        [2]: { CS1010S: 2, CS3217: 2 },
      },
    };

    expect(reducer(state, removeModule(1, 'CS1010S')).colors).toEqual({
      [1]: { CS3216: 0 },
      [2]: { CS1010S: 2, CS3217: 2 },
    });

    expect(reducer(state, removeModule(2, 'CS3217')).colors).toEqual({
      [1]: { CS1010S: 1, CS3216: 0 },
      [2]: { CS1010S: 2 },
    });
  });

  test('should set colors when timetable is set', () => {
    expect(
      reducer(initialState, {
        type: SET_TIMETABLE,
        payload: {
          semester: 1,
          timetable: { CS1010S: {} },
          colors: { CS1010S: 0 },
          hiddenModules: [],
          taModules: {},
        },
      }).colors[1],
    ).toEqual({
      CS1010S: 0,
    });
  });
});

describe('hidden module reducer', () => {
  const withHiddenModules: TimetablesState = {
    ...initialState,
    hidden: { [1]: ['CS1010S'], [2]: ['CS1010S'] },
  };

  test('should update hidden modules', () => {
    expect(reducer(initialState, hideLessonInTimetable(1, 'CS3216'))).toHaveProperty('hidden.1', [
      'CS3216',
    ]);

    expect(reducer(initialState, showLessonInTimetable(1, 'CS1010S'))).toMatchObject({
      hidden: {
        [1]: [],
      },
    });

    expect(reducer(withHiddenModules, showLessonInTimetable(1, 'CS1010S'))).toMatchObject({
      hidden: {
        [1]: [],
        [2]: ['CS1010S'],
      },
    });
  });

  test('should remove modules from list when modules are removed', () => {
    expect(
      reducer(
        {
          ...initialState,
          hidden: { [1]: ['CS1010S'], [2]: ['CS1010S'] },
        },
        removeModule(1, 'CS1010S'),
      ),
    ).toMatchObject({
      hidden: {
        [1]: [],
        [2]: ['CS1010S'],
      },
    });
  });
});

describe('TA module reducer', () => {
  const withTaModules: TimetablesState = {
    ...initialState,
    ta: { [1]: { CS1010S: [['Tutorial', '1']] }, [2]: { CS1010S: [['Tutorial', '1']] } },
  };

  test('should update TA modules', () => {
    expect(
      reducer(initialState, addTaLessonInTimetable(1, 'CS3216', 'Tutorial', '1')),
    ).toHaveProperty('ta.1', { CS3216: [['Tutorial', '1']] });

    expect(
      reducer(initialState, removeTaLessonInTimetable(1, 'CS1010S', 'Tutorial', '1')),
    ).toMatchObject({
      ta: {
        [1]: {},
      },
    });

    expect(
      reducer(withTaModules, removeTaLessonInTimetable(1, 'CS1010S', 'Tutorial', '1')),
    ).toMatchObject({
      ta: {
        [1]: {},
        [2]: { CS1010S: [['Tutorial', '1']] },
      },
    });
  });

  test('should remove modules from list when modules are removed', () => {
    expect(
      reducer(
        {
          ...initialState,
          ta: { [1]: { CS1010S: [['Tutorial', '1']] }, [2]: { CS1010S: [['Tutorial', '1']] } },
        },
        removeModule(1, 'CS1010S'),
      ),
    ).toMatchObject({
      ta: {
        [1]: {},
        [2]: { CS1010S: [['Tutorial', '1']] },
      },
    });
  });

  test('should not add duplicate TA lessons', () => {
    expect(
      reducer(withTaModules, addTaLessonInTimetable(1, 'CS1010S', 'Tutorial', '1')),
    ).toMatchObject({
      ta: {
        [1]: { CS1010S: [['Tutorial', '1']] },
        [2]: { CS1010S: [['Tutorial', '1']] },
      },
    });
  });
});

describe('lesson reducer', () => {
  test('should allow lesson config to be set', () => {
    expect(
      reducer(
        {
          ...initialState,
          lessons: {
            [1]: {
              CS1010S: {
                Lecture: '1',
                Recitation: '2',
              },
              CS3216: {
                Lecture: '1',
              },
            },
            [2]: {
              CS3217: {
                Lecture: '1',
              },
            },
          },
        },
        setLessonConfig(1, 'CS1010S', {
          Lecture: '2',
          Recitation: '3',
          Tutorial: '4',
        }),
      ),
    ).toMatchObject({
      lessons: {
        [1]: {
          CS1010S: {
            Lecture: '2',
            Recitation: '3',
            Tutorial: '4',
          },
          CS3216: {
            Lecture: '1',
          },
        },
        [2]: {
          CS3217: {
            Lecture: '1',
          },
        },
      },
    });
  });
});

describe('stateReconciler', () => {
  const oldArchive = {
    '2015/2016': {
      [1]: {
        GET1006: {
          Lecture: '1',
        },
      },
    },
  };

  const oldLessons = {
    [1]: {
      CS1010S: {
        Lecture: '1',
        Recitation: '2',
      },
    },
    [2]: {
      CS3217: {
        Lecture: '1',
      },
    },
  };

  const inbound: TimetablesState = {
    lessons: oldLessons,
    colors: {
      [1]: {
        CS1010S: 1,
      },
      [2]: {
        CS3217: 2,
      },
    },
    hidden: {
      [1]: ['CS1010S'],
    },
    ta: {},
    academicYear: config.academicYear,
    archive: oldArchive,
  };

  const { stateReconciler } = persistConfig;
  if (!stateReconciler) {
    throw new Error('No stateReconciler');
  }

  const reconcilerPersistConfig = { debug: false } as PersistConfig<TimetablesState>;

  test('should return inbound state when academic year is the same', () => {
    expect(stateReconciler(inbound, initialState, initialState, reconcilerPersistConfig)).toEqual(
      inbound,
    );
  });

  test('should archive old timetables and clear state when academic year is different', () => {
    const oldInbound = {
      ...inbound,
      academicYear: '2016/2017',
    };

    expect(
      stateReconciler(oldInbound, initialState, initialState, reconcilerPersistConfig),
    ).toEqual({
      ...initialState,
      archive: {
        ...oldArchive,
        '2016/2017': oldLessons,
      },
    });
  });
});

describe('import timetable', () => {
  const stateWithHidden = {
    ...initialState,
    hidden: {
      [1]: ['CS1101S', 'CS1231S'],
    },
  };

  test('should have hidden modules set when importing hidden', () => {
    expect(
      reducer(initialState, setHiddenImported(1, ['CS1101S', 'CS1231S'])).hidden,
    ).toMatchObject({
      [1]: ['CS1101S', 'CS1231S'],
    });

    // Should change hidden modules when a new set of modules is imported
    expect(
      reducer(stateWithHidden, setHiddenImported(1, ['CS2100', 'CS2103T'])).hidden,
    ).toMatchObject({
      [1]: ['CS2100', 'CS2103T'],
    });

    // should delete hidden modules when there are none
    expect(reducer(stateWithHidden, setHiddenImported(1, [])).hidden).toMatchObject({
      [1]: [],
    });
  });

  test('should copy over hidden modules when deciding to replace saved timetable', () => {
    expect(
      reducer(stateWithHidden, Internal.setTimetable(1, {}, {}, stateWithHidden.hidden[1])).hidden,
    ).toMatchObject({
      '1': ['CS1101S', 'CS1231S'],
    });
  });
});
