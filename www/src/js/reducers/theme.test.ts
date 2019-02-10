import { FSA } from 'types/redux';
import { ThemeState } from 'types/reducers';

import * as actions from 'actions/theme';
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
