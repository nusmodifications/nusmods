import _ from 'lodash';
import { ADD_MODULE, REMOVE_MODULE } from 'actions/timetables';

const defaultThemeState = {
  // Available themes are defined in `themes.scss`
  id: 'ocean',
  // Mapping of module to color index [0-7]
  colors: {},
};
export const NUM_DIFFERENT_COLORS = 8;

// Returns a new index that is not present in the current color index.
// If there are more than NUM_DIFFERENT_COLORS modules already present,
// will try to balance the color distribution.
function getNewColor(currentColorIndices) {
  function generateInitialIndices() {
    return _.range(NUM_DIFFERENT_COLORS);
  }

  let availableColorIndices = generateInitialIndices();
  currentColorIndices.forEach((index) => {
    availableColorIndices = _.without(availableColorIndices, index);
    if (availableColorIndices.length === 0) {
      availableColorIndices = generateInitialIndices();
    }
  });

  return _.sample(availableColorIndices);
}

function colors(state, action) {
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

function theme(state = defaultThemeState, action) {
  switch (action.type) {
    case ADD_MODULE:
    case REMOVE_MODULE:
      return {
        ...state,
        colors: colors(state.colors, action),
      };
    default:
      return state;
  }
}

export default theme;
