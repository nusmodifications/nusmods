// @flow
import type { FSA } from 'types/redux';

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

export const TOGGLE_TIMETABLE_ORIENTATION: string = 'TOGGLE_TIMETABLE_ORIENTATION';
export function toggleTimetableOrientation(): FSA {
  return {
    type: TOGGLE_TIMETABLE_ORIENTATION,
    payload: null,
  };
}
