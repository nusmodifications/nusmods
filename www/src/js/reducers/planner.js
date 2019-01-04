// @flow
import update from 'immutability-helper';
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

      return update(state, {
        modules: {
          [moduleCode]: {
            $set: [year, semester],
          },
        },
      });
    }

    case REMOVE_PLANNER_MODULE:
      return update(state, {
        modules: {
          $unset: [action.payload.moduleCode],
        },
      });

    default:
      return state;
  }
}
