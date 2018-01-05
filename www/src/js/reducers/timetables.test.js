// @flow

import { timetablesReducer as reducer, defaultTimetableState } from 'reducers/timetables';
import { ADD_MODULE, removeModule, SET_TIMETABLE } from 'actions/timetables';

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
