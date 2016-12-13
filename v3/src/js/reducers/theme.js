// @flow
import type { FSA } from 'types/redux';
/* eslint-disable no-duplicate-imports */
import type {
  ColorIndex,
  ColorMapping,
  ThemeState,
} from 'types/reducers';

import _ from 'lodash';
import { ADD_MODULE, REMOVE_MODULE } from 'actions/timetables';
import { SELECT_THEME, SELECT_MODULE_COLOR, TOGGLE_TIMETABLE_ORIENTATION } from 'actions/theme';

import {
  VERTICAL,
  HORIZONTAL,
} from 'types/reducers';

const defaultColorsState: ColorMapping = {};
const defaultThemeState: ThemeState = {
  // Available themes are defined in `themes.scss`
  id: 'eighties',
  colors: defaultColorsState,
  timetableOrientation: HORIZONTAL,
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
      return {
        ...state,
        colors: colors(state.colors, action),
      };
    case SELECT_THEME:
      return {
        ...state,
        id: action.payload,
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
