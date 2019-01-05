// @flow
import produce from 'immer';
import { toPairs, max } from 'lodash';
import type { PlannerState } from 'types/reducers';
import type { FSA } from 'types/redux';
import {
  ADD_PLANNER_MODULE,
  ADD_PLANNER_YEAR,
  MOVE_PLANNER_MODULE,
  REMOVE_PLANNER_MODULE,
} from 'actions/planner';
import config from 'config';

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

    case ADD_PLANNER_MODULE:
    case MOVE_PLANNER_MODULE: {
      const { year, semester } = action.payload;
      const moduleCode = action.payload.moduleCode.toUpperCase();

      // To insert the module into the correct position we need to shift the other
      // modules
      const otherModules = toPairs(state.modules).filter(([otherModuleCode, timing]) => {
        const [moduleYear, moduleSemester] = timing;
        return otherModuleCode !== moduleCode && moduleYear === year && moduleSemester === semester;
      });
      let index = action.payload.index;
      // If the index is not specified, we insert the new module at the end
      if (index == null) {
        index =
          otherModules.length === 0 ? 0 : max(otherModules.map(([, timing]) => timing[2])) + 1;
      }

      return produce(state, (draft: $Shape<PlannerState>) => {
        // $FlowFixMe states are mutable in immer
        draft.modules[moduleCode] = [year, semester, index];

        otherModules.forEach(([otherModuleCode, timing]) => {
          if (timing[2] >= index) {
            draft.modules[otherModuleCode][2] += 1;
          }
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
