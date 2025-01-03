import { HORIZONTAL, ThemeState, VERTICAL } from 'types/reducers';
import { Theme } from 'types/settings';
import { Actions } from 'types/actions';

import { SET_EXPORTED_DATA } from 'actions/constants';
import {
  CYCLE_THEME,
  SELECT_THEME,
  TOGGLE_TIMETABLE_ORIENTATION,
  TOGGLE_TITLE_DISPLAY,
} from 'actions/theme';
import themes from 'data/themes.json';
import { DIMENSIONS, withTracker } from 'bootstrapping/matomo';

export const defaultThemeState: ThemeState = {
  // Available themes are defined in `themes.scss`
  id: 'eighties',
  numOfColors: 8,
  timetableOrientation: HORIZONTAL,
  showTitle: false,
};
export const themeIds = themes.map((obj: Theme) => obj.id);

function theme(state: ThemeState = defaultThemeState, action: Actions): ThemeState {
  function setTheme(newTheme: Theme): ThemeState {
    // Update theme analytics info
    withTracker((tracker) => tracker.setCustomDimension(DIMENSIONS.theme, newTheme.id));

    return {
      ...state,
      id: newTheme.id,
      numOfColors: newTheme.numOfColors,
    };
  }

  switch (action.type) {
    case SELECT_THEME:
      // Reassign all modules' color when changing theme
      return setTheme(action.payload);

    case CYCLE_THEME: {
      const newThemeIndex =
        (themeIds.indexOf(state.id) + themeIds.length + action.payload) % themeIds.length;

      return setTheme(themes[newThemeIndex]);
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
