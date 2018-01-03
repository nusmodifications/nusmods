// @flow
import type { FSA } from 'types/redux';
import type { ModuleCode } from 'types/modules';
import type { ColorIndex, ColorMapping, TimetableOrientation } from 'types/reducers';

export const SELECT_THEME: string = 'SELECT_THEME';
export function selectTheme(theme: string): FSA {
  return {
    type: SELECT_THEME,
    payload: theme,
  };
}

export const CYCLE_THEME: string = 'CYCLE_THEME';
export function cycleTheme(offset: number): FSA {
  return {
    type: CYCLE_THEME,
    payload: offset,
  };
}

export const SET_COLOR_MAP = 'SET_COLOR_MAP';
export function setColorMap(colors: ColorMapping): FSA {
  return {
    type: SET_COLOR_MAP,
    payload: { colors },
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

export const SET_TIMETABLE_ORIENTATION: string = 'SET_TIMETABLE_ORIENTATION';
export function setTimetableOrientation(orientation: TimetableOrientation): FSA {
  return {
    type: SET_TIMETABLE_ORIENTATION,
    payload: { orientation },
  };
}

export const TOGGLE_TIMETABLE_ORIENTATION: string = 'TOGGLE_TIMETABLE_ORIENTATION';
export function toggleTimetableOrientation(): FSA {
  return {
    type: TOGGLE_TIMETABLE_ORIENTATION,
    payload: null,
  };
}
