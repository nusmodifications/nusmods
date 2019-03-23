import { ModuleCode, Semester } from 'types/modules';
import { FSA } from 'types/redux';
import { CustomModule } from 'types/reducers';

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
  year: string,
  semester: Semester,
  module: { moduleCode: ModuleCode } | { placeholderId: string },
): FSA {
  return {
    type: ADD_PLANNER_MODULE,
    payload: {
      year,
      semester,
      ...module,
    },
  };
}

export const MOVE_PLANNER_MODULE = 'MOVE_PLANNER_MODULE';
export function movePlannerModule(
  id: string,
  year: string,
  semester: Semester,
  index: number,
): FSA {
  return {
    type: MOVE_PLANNER_MODULE,
    payload: {
      id,
      year,
      semester,
      index,
    },
  };
}

export const REMOVE_PLANNER_MODULE = 'REMOVE_PLANNER_MODULE';
export function removePlannerModule(id: string): FSA {
  return {
    type: REMOVE_PLANNER_MODULE,
    payload: {
      id,
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
