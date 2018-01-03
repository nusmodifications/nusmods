// @flow
import type { FSA } from 'types/redux';
import type { ThemeState } from 'types/reducers';

import * as actions from 'actions/theme';
import { SET_TIMETABLE } from 'actions/timetables';
import reducer, { defaultThemeState, themeIds } from 'reducers/theme';
import { VERTICAL } from 'types/reducers';

const themeInitialState: ThemeState = defaultThemeState;
const googleTheme = 'google';
const themeWithEighties: ThemeState = { ...themeInitialState, id: googleTheme };
const themeWithFirstTheme: ThemeState = { ...themeInitialState, id: themeIds[0] };
const themeWithLastTheme: ThemeState = { ...themeInitialState, id: themeIds[themeIds.length - 1] };
const themeWithVerticalOrientation: ThemeState = {
  ...themeInitialState,
  timetableOrientation: VERTICAL,
};

describe('theme', () => {
  test('can select theme', () => {
    const action: FSA = actions.selectTheme(googleTheme);
    const nextState: ThemeState = reducer(themeInitialState, action);
    expect(nextState).toEqual(themeWithEighties);
  });

  describe('can cycle theme', () => {
    test('can cycle forwards and backwards', () => {
      const cycleForwardAction: FSA = actions.cycleTheme(1);
      const nextState: ThemeState = reducer(themeInitialState, cycleForwardAction);
      expect(themeIds.indexOf(nextState.id)).toEqual(themeIds.indexOf(themeInitialState.id) + 1);

      const cycleBackwardAction: FSA = actions.cycleTheme(-1);
      const nextState2: ThemeState = reducer(nextState, cycleBackwardAction);
      expect(nextState2).toEqual(themeInitialState);
    });

    test('cycle wrapping behavior', () => {
      const cycleForwardAction: FSA = actions.cycleTheme(1);
      const nextState: ThemeState = reducer(themeWithLastTheme, cycleForwardAction);
      expect(nextState).toEqual(themeWithFirstTheme);

      const cycleBackwardAction: FSA = actions.cycleTheme(-1);
      const nextState2: ThemeState = reducer(themeWithFirstTheme, cycleBackwardAction);
      expect(nextState2).toEqual(themeWithLastTheme);
    });
  });

  test('toggle timetable orientation', () => {
    const action: FSA = actions.toggleTimetableOrientation();
    const nextState: ThemeState = reducer(themeInitialState, action);
    expect(nextState).toEqual(themeWithVerticalOrientation);

    const nextState2: ThemeState = reducer(nextState, action);
    expect(nextState2).toEqual(themeInitialState);
  });
});

describe('colors map', () => {
  test('should ignore empty color property when setting timetable', () => {
    expect(
      reducer(
        {
          ...themeInitialState,
          colors: { CS1010S: 0, CS3216: 1 },
        },
        {
          type: SET_TIMETABLE,
          payload: {},
        },
      ).colors,
    ).toEqual({ CS1010S: 0, CS3216: 1 });
  });

  test('should merge color map when setting timetable', () => {
    expect(
      reducer(
        {
          ...themeInitialState,
          colors: { CS1010S: 0, CS3216: 1 },
        },
        {
          type: SET_TIMETABLE,
          payload: {
            colors: { CS1010S: 2, CS2105: 0, CS1231: 4 },
          },
        },
      ).colors,
    ).toEqual({ CS1010S: 2, CS3216: 1, CS2105: 0, CS1231: 4 });
  });
});
