// @flow

import type { PlannerState } from 'types/reducers';
import type { FSA } from 'types/redux';

const defaultPlannerState: PlannerState = {
  modules: {},
};

export const persistConfig = {};

export default function planner(
  state: PlannerState = defaultPlannerState,
  action: FSA,
): PlannerState {
  switch (action.type) {
    default:
      return state;
  }
}
