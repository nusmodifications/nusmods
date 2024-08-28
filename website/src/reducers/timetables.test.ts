import config from 'config';
import reducer, { defaultTimetableState, persistConfig } from 'reducers/timetables';
import {
  ADD_MODULE,
  hideLessonInTimetable,
  removeModule,
  SET_TIMETABLE,
  setLessonConfig,
  showLessonInTimetable,
  setHiddenImported,
  HIDDEN_IMPORTED_SEM,
  Internal,
  addCustomModule,
  modifyCustomModule,
  deleteCustomModule,
} from 'actions/timetables';
import { TimetablesState } from 'types/reducers';
import { PersistConfig } from 'redux-persist/es/types';
import { CustomModuleLesson } from 'types/timetables';

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
          customModules: {},
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

describe('custom modules reducer', () => {
  const lesson: CustomModuleLesson = {
    classNo: '01',
    day: 'Monday',
    startTime: '0800',
    endTime: '0900',
    lessonType: 'Lecture',
    venue: 'COM1-0330',
    moduleCode: 'CS1101S',
    title: 'Programming Methodology',
    isCustom: true,
  };
  test('should allow new custom modules', () => {
    expect(reducer(initialState, addCustomModule(1, 'CS1101S', lesson))).toMatchObject({
      customModules: {
        '1': {
          CS1101S: lesson,
        },
      },
    });
  });

  test('should allow changing of custom modules', () => {
    expect(
      reducer(
        {
          ...initialState,
          customModules: {
            '1': {
              CS1101S: lesson,
            },
          },
        },
        modifyCustomModule(1, 'CS1101S', 'CS2030', lesson),
      ),
    ).toMatchObject({
      customModules: {
        '1': {
          CS2030: lesson,
        },
      },
    });
  });

  test('should allow changing of custom modules', () => {
    expect(
      reducer(
        {
          ...initialState,
          customModules: {
            '1': {
              CS1101S: lesson,
            },
          },
        },
        deleteCustomModule(1, 'CS1101S'),
      ),
    ).toMatchObject({
      customModules: {},
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
    academicYear: config.academicYear,
    archive: oldArchive,
    customModules: {},
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
  test('should have hidden modules set when importing hidden', () => {
    expect(reducer(initialState, setHiddenImported(['CS1101S', 'CS1231S'])).hidden).toMatchObject({
      [HIDDEN_IMPORTED_SEM]: ['CS1101S', 'CS1231S'],
    });

    // Should change hidden modules when a new set of modules is imported
    expect(
      reducer(
        {
          ...initialState,
          hidden: {
            [HIDDEN_IMPORTED_SEM]: ['CS1101S', 'CS1231S'],
          },
        },
        setHiddenImported(['CS2100', 'CS2103T']),
      ).hidden,
    ).toMatchObject({
      [HIDDEN_IMPORTED_SEM]: ['CS2100', 'CS2103T'],
    });

    // should delete hidden modules when there are none
    expect(
      reducer(
        {
          ...initialState,
          hidden: {
            [HIDDEN_IMPORTED_SEM]: ['CS1101S', 'CS1231S'],
          },
        },
        setHiddenImported([]),
      ).hidden,
    ).toMatchObject({
      [HIDDEN_IMPORTED_SEM]: [],
    });
  });

  test('should copy over hidden modules when deciding to replace saved timetable', () => {
    expect(
      reducer(
        {
          ...initialState,
          hidden: {
            [HIDDEN_IMPORTED_SEM]: ['CS1101S', 'CS1231S'],
          },
        },
        Internal.setTimetable(1, {}, {}, ['CS1101S', 'CS1231S']),
      ).hidden,
    ).toMatchObject({
      '1': ['CS1101S', 'CS1231S'],
    });
  });
});
