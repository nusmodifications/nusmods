// @flow

import reducer, { defaultTimetableState } from 'reducers/timetables';
import {
  ADD_MODULE,
  SET_TIMETABLE,
  hideLessonInTimetable,
  removeModule,
  showLessonInTimetable,
  setLessonConfig,
} from 'actions/timetables';
import type { TimetablesState } from 'types/reducers';

const initialState = defaultTimetableState;

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
