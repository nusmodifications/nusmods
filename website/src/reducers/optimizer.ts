import { OptimizerState } from 'types/reducers';
import { Actions } from 'types/actions';

import {
  TOGGLE_OPTIMIZER_DISPLAY
} from 'actions/optimizer';

export const defaultOptimizerState: OptimizerState = {
  isOptimizerShown: false
};

function optimizer(state: OptimizerState = defaultOptimizerState, action: Actions): OptimizerState {
  switch (action.type) {
    case TOGGLE_OPTIMIZER_DISPLAY:
      return {
        ...state,
        isOptimizerShown: !state.isOptimizerShown,
      };
    default:
      return state;
  }
}

export default optimizer;
