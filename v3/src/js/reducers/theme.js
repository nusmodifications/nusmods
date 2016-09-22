// @flow

import _ from 'lodash';
import { ADD_MODULE, REMOVE_MODULE } from 'actions/timetables';
import { CHANGE_THEME } from 'actions/theme';

import type { FSA } from 'redux';
import type { ColorIndex, ColorMapping, ThemeState } from 'types/reducers';

const defaultColorsState: ColorMapping = {};
const defaultThemeState: ThemeState = {
  // Available themes are defined in `themes.scss`
  id: 'ocean',
  colors: defaultColorsState,
};

export const NUM_DIFFERENT_COLORS: number = 8;

// Returns a new index that is not present in the current color index.
// If there are more than NUM_DIFFERENT_COLORS modules already present,
// will try to balance the color distribution.
function getNewColor(currentColorIndices: Array<ColorIndex>): number {
  function generateInitialIndices(): Array<number> {
    return _.range(NUM_DIFFERENT_COLORS);
  }

  let availableColorIndices = generateInitialIndices();
  currentColorIndices.forEach((index: ColorIndex) => {
    availableColorIndices = _.without(availableColorIndices, index);
    if (availableColorIndices.length === 0) {
      availableColorIndices = generateInitialIndices();
    }
  });

  return _.sample(availableColorIndices);
}

function colors(state: ColorMapping, action: FSA): ColorMapping {
  switch (action.type) {
    case ADD_MODULE:
      return {
        ...state,
        [action.payload.moduleCode]: getNewColor(_.values(state)),
      };
    case REMOVE_MODULE:
      return _.omit(state, action.payload.moduleCode);
    default:
      return state;
  }
}

function theme(state: ThemeState = defaultThemeState, action: FSA): ThemeState {
  switch (action.type) {
    case ADD_MODULE:
    case REMOVE_MODULE:
      return {
        ...state,
        colors: colors(state.colors, action),
      };
    case CHANGE_THEME:
      return {
        ...state,
        id: action.payload.theme,
      };
    default:
      return state;
  }
}

export default theme;
