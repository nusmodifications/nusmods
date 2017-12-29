// @flow
import type { FSA } from 'types/redux';
import type { ColorMapping, ThemeState } from 'types/reducers';
import type { Theme } from 'types/settings';

import { omit, values } from 'lodash';
import { getNewColor } from 'utils/colors';
import { ADD_MODULE, REMOVE_MODULE, SET_TIMETABLE } from 'actions/timetables';
import {
  SELECT_THEME,
  CYCLE_THEME,
  SELECT_MODULE_COLOR,
  TOGGLE_TIMETABLE_ORIENTATION,
  SET_TIMETABLE_ORIENTATION,
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
    case ADD_MODULE: {
      const colorIndex =
        typeof action.payload.colorIndex === 'number'
          ? action.payload.colorIndex
          : getNewColor(values(state));
      return {
        ...state,
        [action.payload.moduleCode]: colorIndex,
      };
    }
    case SET_TIMETABLE:
      if (action.payload.colors) return state;
      return {
        ...state,
        ...action.payload.colors,
      };
    case REMOVE_MODULE:
      return omit(state, action.payload.moduleCode);
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
    case ADD_MODULE:
    case REMOVE_MODULE:
    case SELECT_MODULE_COLOR:
    case SET_TIMETABLE:
      return {
        ...state,
        colors: colors(state.colors, action),
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
    case SET_TIMETABLE_ORIENTATION:
      return {
        ...state,
        timetableOrientation: action.payload.orientation,
      };
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
