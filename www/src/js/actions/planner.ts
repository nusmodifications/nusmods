// @flow

import type { ModuleCode, Semester } from 'types/modules';
import type { FSA } from 'types/redux';
import type { CustomModule } from 'types/reducers';

export const SET_PLANNER_MIN_YEAR = 'SET_PLANNER_MIN_YEAR';
export function setPlannerMinYear(year: string) {
  return {
    type: SET_PLANNER_MIN_YEAR,
    payload: year,
  };
}

export const SET_PLANNER_MAX_YEAR = 'SET_PLANNER_MAX_YEAR';
export function setPlannerMaxYear(year: string) {
  return {
    type: SET_PLANNER_MAX_YEAR,
    payload: year,
  };
}

export const SET_PLANNER_IBLOCS = 'SET_PLANNER_IBLOCS';
export function setPlannerIBLOCs(iblocs: boolean) {
  return {
    type: SET_PLANNER_IBLOCS,
    payload: iblocs,
  };
}

export const ADD_PLANNER_MODULE = 'ADD_PLANNER_MODULE';
export function addPlannerModule(
  moduleCode: ModuleCode,
  year: string,
  semester: Semester,
  index: ?number = null,
): FSA {
  return {
    type: ADD_PLANNER_MODULE,
    payload: {
      year,
      semester,
      moduleCode,
      index,
    },
  };
}

export const MOVE_PLANNER_MODULE = 'MOVE_PLANNER_MODULE';
export function movePlannerModule(
  moduleCode: ModuleCode,
  year: string,
  semester: Semester,
  index: ?number = null,
): FSA {
  return {
    type: MOVE_PLANNER_MODULE,
    payload: {
      year,
      semester,
      moduleCode,
      index,
    },
  };
}

export const REMOVE_PLANNER_MODULE = 'REMOVE_PLANNER_MODULE';
export function removePlannerModule(moduleCode: ModuleCode): FSA {
  return {
    type: REMOVE_PLANNER_MODULE,
    payload: {
      moduleCode,
    },
  };
}

export const ADD_CUSTOM_PLANNER_DATA = 'ADD_CUSTOM_PLANNER_DATA';
export function addCustomModule(moduleCode: ModuleCode, data: CustomModule): FSA {
  return {
    type: ADD_CUSTOM_PLANNER_DATA,
    payload: { moduleCode, data },
  };
}
