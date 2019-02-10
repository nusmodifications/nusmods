// @flow

import reducer, { defaultTimetableState, persistConfig } from 'reducers/timetables';
import {
  ADD_MODULE,
  SET_TIMETABLE,
  hideLessonInTimetable,
  removeModule,
  showLessonInTimetable,
  setLessonConfig,
} from 'actions/timetables';
import type { TimetablesState } from 'types/reducers';
import config from 'config';

const initialState = defaultTimetableState;

jest.mock('config');

/* eslint-disable no-useless-computed-key */
describe('color reducers', () => {
  test('should add colors when modules are added', () => {
    function addModule(semester, moduleCode) {
      return {
        type: ADD_MODULE,
        payload: {
          semester,
          moduleCode,
        },
      };
    }

    expect(reducer(initialState, addModule(1, 'CS1010S')).colors).toHaveProperty('1.CS1010S');
    expect(reducer(initialState, addModule(2, 'CS3216')).colors).toHaveProperty('2.CS3216');
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
    function setTimetable(semester, timetable, colors) {
      return {
        type: SET_TIMETABLE,
        payload: { semester, timetable, colors },
      };
    }

    expect(
      reducer(initialState, setTimetable(1, { CS1010S: {} }, { CS1010S: 0 })).colors[1],
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
        CS1010S: '1',
      },
      [2]: {
        CS3217: '2',
      },
    },
    hidden: {
      [1]: {
        CS1010S: '1',
      },
    },
    academicYear: config.academicYear,
    archive: oldArchive,
  };

  const { stateReconciler } = persistConfig;
  if (!stateReconciler) {
    throw new Error('No stateReconciler');
  }

  test('should return inbound state when academic year is the same', () => {
    expect(stateReconciler(inbound, initialState, initialState, { debug: false })).toEqual(inbound);
  });

  test('should archive old timetables and clear state when academic year is different', () => {
    const oldInbound = {
      ...inbound,
      academicYear: '2016/2017',
    };

    expect(
      stateReconciler(oldInbound, initialState, initialState, {
        debug: false,
      }),
    ).toEqual({
      ...initialState,
      archive: {
        ...oldArchive,
        '2016/2017': oldLessons,
      },
    });
  });
});
