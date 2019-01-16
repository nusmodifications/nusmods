// @flow
import produce from 'immer';
import { pull } from 'lodash';
import type { PlannerState } from 'types/reducers';
import type { FSA } from 'types/redux';
import {
  ADD_PLANNER_MODULE,
  ADD_PLANNER_YEAR,
  MOVE_PLANNER_MODULE,
  REMOVE_PLANNER_MODULE,
} from 'actions/planner';
import config from 'config';
import { filterModuleForSemester } from 'selectors/planner';

const defaultPlannerState: PlannerState = {
  minYear: config.academicYear,
  maxYear: config.academicYear,

  modules: {},
};

export default function planner(
  state: PlannerState = defaultPlannerState,
  action: FSA,
): PlannerState {
  switch (action.type) {
    case ADD_PLANNER_YEAR:
      // Check if it is smaller or larger than existing years
      if (action.payload < state.minYear) {
        return {
          ...state,
          minYear: action.payload,
        };
      } else if (action.payload > state.maxYear) {
        return {
          ...state,
          maxYear: action.payload,
        };
      }

      return state;

    // Adding and updating planner modules currently do the exact same thing.
    // We assume the user knows when evoking MOVE that the module is in the
    // planner already
    case ADD_PLANNER_MODULE:
    case MOVE_PLANNER_MODULE: {
      const { year, semester, index } = action.payload;
      const moduleCode = action.payload.moduleCode.toUpperCase();

      // Insert the module into its new location and update the location of
      // all other modules on the list
      const newModuleOrder = pull(
        filterModuleForSemester(state.modules, year, semester),
        moduleCode,
      );

      // If index is not specified we assume the module is to be pushed to the
      // end of the index
      if (index == null) {
        newModuleOrder.push(moduleCode);
      } else {
        newModuleOrder.splice(index, 0, moduleCode);
      }

      // If the module is moved from another year / semeser, then we also need
      // to update the index of the old module list
      let oldModuleOrder = [];
      if (state.modules[moduleCode]) {
        const [oldYear, oldSemester] = state.modules[moduleCode];
        if (oldYear !== year || oldSemester !== semester) {
          oldModuleOrder = pull(
            filterModuleForSemester(state.modules, oldYear, oldSemester),
            moduleCode,
          );
        }
      }

      return produce(state, (draft: $Shape<PlannerState>) => {
        // $FlowFixMe states are mutable in immer
        draft.modules[moduleCode] = [year, semester, index];

        newModuleOrder.forEach((newModuleCode, order) => {
          draft.modules[newModuleCode][2] = order;
        });

        oldModuleOrder.forEach((oldModuleCode, order) => {
          draft.modules[oldModuleCode][2] = order;
        });
      });
    }

    case REMOVE_PLANNER_MODULE:
      return produce(state, (draft) => {
        delete draft.modules[action.payload.moduleCode];
      });

    default:
      return state;
  }
}
