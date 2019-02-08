// @flow
import produce from 'immer';
import { pull, max, min } from 'lodash';
import type { PlannerState } from 'types/reducers';
import type { FSA } from 'types/redux';
import {
  ADD_PLANNER_MODULE,
  MOVE_PLANNER_MODULE,
  REMOVE_PLANNER_MODULE,
  SET_PLANNER_IBLOCS,
  SET_PLANNER_MAX_YEAR,
  SET_PLANNER_MIN_YEAR,
  ADD_CUSTOM_PLANNER_DATA,
} from 'actions/planner';
import config from 'config';
import { filterModuleForSemester } from 'selectors/planner';

const defaultPlannerState: PlannerState = {
  minYear: config.academicYear,
  maxYear: config.academicYear,
  iblocs: false,

  modules: {},
  custom: {},
};

export default function planner(
  state: PlannerState = defaultPlannerState,
  action: FSA,
): PlannerState {
  switch (action.type) {
    case SET_PLANNER_MIN_YEAR:
      return {
        ...state,
        minYear: action.payload,
        maxYear: max([action.payload, state.maxYear]),
      };

    case SET_PLANNER_MAX_YEAR:
      return {
        ...state,
        maxYear: action.payload,
        minYear: min([action.payload, state.minYear]),
      };

    case SET_PLANNER_IBLOCS:
      return { ...state, iblocs: action.payload };

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

      // If the module is moved from another year / semester, then we also need
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

    case ADD_CUSTOM_PLANNER_DATA:
      return produce(state, (draft) => {
        draft.custom[action.payload.moduleCode] = action.payload.data;
      });

    default:
      return state;
  }
}
