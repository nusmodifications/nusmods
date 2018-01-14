// @flow
import type { FSA } from 'types/redux';
import type { ColorMapping, ThemeState } from 'types/reducers';
import type { Theme } from 'types/settings';

import { SET_EXPORTED_DATA } from 'actions/export';
import {
  SELECT_THEME,
  CYCLE_THEME,
  TOGGLE_TIMETABLE_ORIENTATION,
  TOGGLE_TITLE_DISPLAY,
} from 'actions/theme';
import themes from 'data/themes.json';
import { VERTICAL, HORIZONTAL } from 'types/reducers';

const defaultColorsState: ColorMapping = {};
export const defaultThemeState: ThemeState = {
  // Available themes are defined in `themes.scss`
  id: 'eighties',
  colors: defaultColorsState,
  timetableOrientation: HORIZONTAL,
  showTitle: false,
};
export const themeIds = themes.map((obj: Theme) => obj.id);

function theme(state: ThemeState = defaultThemeState, action: FSA): ThemeState {
  switch (action.type) {
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
    case SET_EXPORTED_DATA:
      return action.payload.theme;
    case TOGGLE_TITLE_DISPLAY:
      return {
        ...state,
        showTitle: !state.showTitle,
      };
    default:
      return state;
  }
}

export default theme;
