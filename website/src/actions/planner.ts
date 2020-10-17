import { ModuleCode, Semester } from 'types/modules';
import { AddModuleData } from 'types/planner';
import { CustomModule } from 'types/reducers';

export const SET_PLANNER_MIN_YEAR = 'SET_PLANNER_MIN_YEAR' as const;
export function setPlannerMinYear(year: string) {
  return {
    type: SET_PLANNER_MIN_YEAR,
    payload: year,
  };
}

export const SET_PLANNER_MAX_YEAR = 'SET_PLANNER_MAX_YEAR' as const;
export function setPlannerMaxYear(year: string) {
  return {
    type: SET_PLANNER_MAX_YEAR,
    payload: year,
  };
}

export const SET_PLANNER_IBLOCS = 'SET_PLANNER_IBLOCS' as const;
export function setPlannerIBLOCs(iblocs: boolean) {
  return {
    type: SET_PLANNER_IBLOCS,
    payload: iblocs,
  };
}

export const ADD_PLANNER_MODULE = 'ADD_PLANNER_MODULE' as const;
export function addPlannerModule(year: string, semester: Semester, module: AddModuleData) {
  return {
    type: ADD_PLANNER_MODULE,
    payload: {
      year,
      semester,
      ...module,
    },
  };
}

export const MOVE_PLANNER_MODULE = 'MOVE_PLANNER_MODULE' as const;
export function movePlannerModule(id: string, year: string, semester: Semester, index: number) {
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

export const MOVE_PLANNER_YEAR_LONG_MODULE = 'MOVE_PLANNER_YEAR_LONG_MODULE' as const;
export function movePlannerYearLongModule(
  year: string,
  semester: Semester,
  moduleCode: ModuleCode,
) {
  return {
    type: MOVE_PLANNER_YEAR_LONG_MODULE,
    payload: {
      year,
      semester,
      moduleCode,
    },
  };
}

export const REMOVE_PLANNER_MODULE = 'REMOVE_PLANNER_MODULE' as const;
export function removePlannerModule(id: string) {
  return {
    type: REMOVE_PLANNER_MODULE,
    payload: {
      id,
    },
  };
}

export const SET_PLACEHOLDER_MODULE = 'SET_PLACEHOLDER_MODULE' as const;
export function setPlaceholderModule(id: string, moduleCode: ModuleCode) {
  return {
    type: SET_PLACEHOLDER_MODULE,
    payload: {
      id,
      moduleCode,
    },
  };
}

export const ADD_CUSTOM_PLANNER_DATA = 'ADD_CUSTOM_PLANNER_DATA' as const;
export function addCustomModule(moduleCode: ModuleCode, data: CustomModule) {
  return {
    type: ADD_CUSTOM_PLANNER_DATA,
    payload: { moduleCode, data },
  };
}
