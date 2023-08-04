import { ThemeState, VERTICAL } from 'types/reducers';

import * as actions from 'actions/theme';
import reducer, { defaultThemeState, themeIds } from 'reducers/theme';

const themeInitialState: ThemeState = defaultThemeState;
const googleTheme = 'google';
const themeWithEighties: ThemeState = { ...themeInitialState, id: googleTheme };
const themeWithFirstTheme: ThemeState = { ...themeInitialState, id: themeIds[0]! };
const themeWithLastTheme: ThemeState = { ...themeInitialState, id: themeIds[themeIds.length - 1]! };
const themeWithVerticalOrientation: ThemeState = {
  ...themeInitialState,
  timetableOrientation: VERTICAL,
};

describe('theme', () => {
  test('can select theme', () => {
    const action = actions.selectTheme(googleTheme);
    const nextState: ThemeState = reducer(themeInitialState, action);
    expect(nextState).toEqual(themeWithEighties);
  });

  describe('can cycle theme', () => {
    test('can cycle forwards and backwards', () => {
      const cycleForwardAction = actions.cycleTheme(1);
      const nextState: ThemeState = reducer(themeInitialState, cycleForwardAction);
      expect(themeIds.indexOf(nextState.id)).toEqual(themeIds.indexOf(themeInitialState.id) + 1);

      const cycleBackwardAction = actions.cycleTheme(-1);
      const nextState2: ThemeState = reducer(nextState, cycleBackwardAction);
      expect(nextState2).toEqual(themeInitialState);
    });

    test('cycle wrapping behavior', () => {
      const cycleForwardAction = actions.cycleTheme(1);
      const nextState: ThemeState = reducer(themeWithLastTheme, cycleForwardAction);
      expect(nextState).toEqual(themeWithFirstTheme);

      const cycleBackwardAction = actions.cycleTheme(-1);
      const nextState2: ThemeState = reducer(themeWithFirstTheme, cycleBackwardAction);
      expect(nextState2).toEqual(themeWithLastTheme);
    });
  });

  test('toggle timetable orientation', () => {
    const action = actions.toggleTimetableOrientation();
    const nextState: ThemeState = reducer(themeInitialState, action);
    expect(nextState).toEqual(themeWithVerticalOrientation);

    const nextState2: ThemeState = reducer(nextState, action);
    expect(nextState2).toEqual(themeInitialState);
  });
});
