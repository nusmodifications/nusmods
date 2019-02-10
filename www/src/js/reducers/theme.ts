import { FSA } from 'types/redux';
import { ColorMapping, ThemeState } from 'types/reducers';
import { Theme } from 'types/settings';

import { SET_EXPORTED_DATA } from 'actions/export';
import {
  SELECT_THEME,
  CYCLE_THEME,
  TOGGLE_TIMETABLE_ORIENTATION,
  TOGGLE_TITLE_DISPLAY,
} from 'actions/theme';
import themes from 'data/themes.json';
import { VERTICAL, HORIZONTAL } from 'types/reducers';
import { DIMENSIONS, withTracker } from 'bootstrapping/mamoto';

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
  function setTheme(newTheme: string): ThemeState {
    // Update theme analytics info
    withTracker((tracker) => tracker.setCustomDimension(DIMENSIONS.theme, newTheme));

    return {
      ...state,
      id: newTheme,
    };
  }

  switch (action.type) {
    case SELECT_THEME:
      return setTheme(action.payload);

    case CYCLE_THEME: {
      const newThemeIndex =
        (themeIds.indexOf(state.id) + themeIds.length + action.payload) % themeIds.length;

      return setTheme(themeIds[newThemeIndex]);
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
