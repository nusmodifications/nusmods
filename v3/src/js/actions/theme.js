// @flow
import type { FSA } from 'types/redux';
import type { ModuleCode } from 'types/modules';
import type { ColorIndex } from 'types/reducers';

export const SELECT_THEME: string = 'SELECT_THEME';
export function selectTheme(theme: string): FSA {
  return {
    type: SELECT_THEME,
    payload: theme,
  };
}

export const SELECT_MODULE_COLOR: string = 'SELECT_MODULE_COLOR';
export function selectModuleColor(moduleCode: ModuleCode, colorIndex: ColorIndex): FSA {
  return {
    type: SELECT_MODULE_COLOR,
    payload: {
      moduleCode,
      colorIndex,
    },
  };
}

export const TOGGLE_TIMETABLE_ORIENTATION: string = 'TOGGLE_TIMETABLE_ORIENTATION';
export function toggleTimetableOrientation(): FSA {
  return {
    type: TOGGLE_TIMETABLE_ORIENTATION,
    payload: null,
  };
}
