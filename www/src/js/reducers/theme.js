// @flow
import type { FSA } from 'types/redux';
import type { ColorMapping, ThemeState } from 'types/reducers';
import type { Theme } from 'types/settings';

import {
  SELECT_THEME,
  CYCLE_THEME,
  SELECT_MODULE_COLOR,
  TOGGLE_TIMETABLE_ORIENTATION,
  SET_COLOR_MAP,
} from 'actions/theme';
import themes from 'data/themes.json';

import { VERTICAL, HORIZONTAL } from 'types/reducers';

const defaultColorsState: ColorMapping = {};
export const defaultThemeState: ThemeState = {
  // Available themes are defined in `themes.scss`
  id: 'eighties',
  colors: defaultColorsState,
  timetableOrientation: HORIZONTAL,
};
export const themeIds = themes.map((obj: Theme) => obj.id);

function colors(state: ColorMapping, action: FSA): ColorMapping {
  if (!(action.payload && action.payload.moduleCode)) {
    return state;
  }
  switch (action.type) {
    case SELECT_MODULE_COLOR:
      return {
        ...state,
        [action.payload.moduleCode]: action.payload.colorIndex,
      };
    default:
      return state;
  }
}

function theme(state: ThemeState = defaultThemeState, action: FSA): ThemeState {
  switch (action.type) {
    case SELECT_MODULE_COLOR:
      return {
        ...state,
        colors: colors(state.colors, action),
      };
    case SET_COLOR_MAP:
      return {
        ...state,
        colors: action.payload.colors,
      };
    case SELECT_THEME:
      return {
        ...state,
        id: action.payload,
      };
    case CYCLE_THEME: {
      const newThemeIndex =
        (themeIds.indexOf(state.id) + themeIds.length + action.payload) % themeIds.length;
      return {
        ...state,
        id: themeIds[newThemeIndex],
      };
    }
    case TOGGLE_TIMETABLE_ORIENTATION:
      return {
        ...state,
        timetableOrientation: state.timetableOrientation === VERTICAL ? HORIZONTAL : VERTICAL,
      };
    default:
      return state;
  }
}

export default theme;
