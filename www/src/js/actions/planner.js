// @flow

import type { ModuleCode, Semester } from 'types/modules';
import type { FSA } from 'types/redux';

export const ADD_PLANNER_YEAR = 'ADD_PLANNER_YEAR';
export function addPlannerYear(year: string): FSA {
  return {
    type: ADD_PLANNER_YEAR,
    payload: year,
  };
}

export const ADD_PLANNER_MODULE = 'ADD_PLANNER_MODULE';
export function addPlannerModule(moduleCode: ModuleCode, year: string, semester: Semester): FSA {
  return {
    type: ADD_PLANNER_MODULE,
    payload: {
      year,
      semester,
      moduleCode,
    },
  };
}

export const MOVE_PLANNER_MODULE = 'MOVE_PLANNER_MODULE'
export function movePlannerModule(moduleCode: ModuleCode, year: string, semester: Semester): FSA {
  return {
    type: MOVE_PLANNER_MODULE,
    payload: {
      year,
      semester,
      moduleCode,
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
