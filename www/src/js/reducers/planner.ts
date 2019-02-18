import produce from 'immer';
import { pull, max, min } from 'lodash';
import { isType } from 'typescript-fsa';
import { Action } from 'redux';

import { PlannerState } from 'types/reducers';
import { ModuleCode } from 'types/modules';
import {
  setMinYear,
  setMaxYear,
  setIBLOCs,
  addModule,
  moveModule,
  removeModule,
  addCustomModule,
} from 'actions/planner';
import { filterModuleForSemester } from 'selectors/planner';
import config from 'config';

const defaultPlannerState: PlannerState = {
  minYear: config.academicYear,
  maxYear: config.academicYear,
  iblocs: false,

  modules: {},
  custom: {},
};

export default function planner(
  state: PlannerState = defaultPlannerState,
  action: Action,
): PlannerState {
  if (isType(action, setMinYear)) {
    return {
      ...state,
      minYear: action.payload,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      maxYear: max([action.payload, state.maxYear])!,
    };
  }

  if (isType(action, setMaxYear)) {
    return {
      ...state,
      maxYear: action.payload,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      minYear: min([action.payload, state.minYear])!,
    };
  }

  if (isType(action, setIBLOCs)) {
    return { ...state, iblocs: action.payload };
  }

  if (isType(action, removeModule)) {
    return produce(state, (draft) => {
      delete draft.modules[action.payload.moduleCode];
    });
  }

  if (isType(action, addCustomModule)) {
    return produce(state, (draft) => {
      draft.custom[action.payload.moduleCode] = action.payload.data;
    });
  }

  if (isType(action, addModule) || isType(action, moveModule)) {
    const { year, semester, index = null } = action.payload;

    const moduleCode = action.payload.moduleCode.toUpperCase();

    // Insert the module into its new location and update the location of
    // all other modules on the list
    const newModuleOrder = pull(filterModuleForSemester(state.modules, year, semester), moduleCode);

    // If index is not specified we assume the module is to be pushed to the
    // end of the index
    if (index == null) {
      newModuleOrder.push(moduleCode);
    } else {
      newModuleOrder.splice(index, 0, moduleCode);
    }

    // If the module is moved from another year / semester, then we also need
    // to update the index of the old module list
    let oldModuleOrder: ModuleCode[] = [];
    if (state.modules[moduleCode]) {
      const [oldYear, oldSemester] = state.modules[moduleCode];
      if (oldYear !== year || oldSemester !== semester) {
        oldModuleOrder = pull(
          filterModuleForSemester(state.modules, oldYear, oldSemester),
          moduleCode,
        );
      }
    }

    return produce(state, (draft) => {
      draft.modules[moduleCode] = [year, semester, index || newModuleOrder.length - 1];

      newModuleOrder.forEach((newModuleCode, order) => {
        draft.modules[newModuleCode][2] = order;
      });

      oldModuleOrder.forEach((oldModuleCode, order) => {
        draft.modules[oldModuleCode][2] = order;
      });
    });
  }

  return state;
}
