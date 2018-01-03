// @flow
import type { FSA } from 'types/redux';
import type { ColorMapping, ThemeState } from 'types/reducers';
import type { Theme } from 'types/settings';

import { persistReducer } from 'redux-persist';

import createPersistConfig from 'storage/createPersistConfig';
import { SET_EXPORTED_DATA } from 'actions/export';
import { SET_TIMETABLE } from 'actions/timetables';
import {
  SELECT_THEME,
  CYCLE_THEME,
  SELECT_MODULE_COLOR,
  TOGGLE_TIMETABLE_ORIENTATION,
  SET_TIMETABLE_ORIENTATION,
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
  switch (action.type) {
    case SELECT_MODULE_COLOR:
      if (!(action.payload && action.payload.moduleCode)) {
        return state;
      }

      return {
        ...state,
        [action.payload.moduleCode]: action.payload.colorIndex,
      };

    case SET_COLOR_MAP:
      return action.payload.colors;

    case SET_TIMETABLE:
      if (!action.payload.colors) return state;

      return {
        ...state,
        ...action.payload.colors,
      };
    default:
      return state;
  }
}

function theme(state: ThemeState = defaultThemeState, action: FSA): ThemeState {
  switch (action.type) {
    case SELECT_MODULE_COLOR:
    case SET_COLOR_MAP:
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
    case SET_EXPORTED_DATA:
      return action.payload.theme;
    default:
      return state;
  }
}

export default persistReducer(createPersistConfig('theme'), theme);
