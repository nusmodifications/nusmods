import { FSA } from 'types/redux';

export const SELECT_THEME = 'SELECT_THEME';
export function selectTheme(theme: string): FSA {
  return {
    type: SELECT_THEME,
    payload: theme,
  };
}

export const CYCLE_THEME = 'CYCLE_THEME';
export function cycleTheme(offset: number): FSA {
  return {
    type: CYCLE_THEME,
    payload: offset,
  };
}

export const TOGGLE_TIMETABLE_ORIENTATION = 'TOGGLE_TIMETABLE_ORIENTATION';
export function toggleTimetableOrientation(): FSA {
  return {
    type: TOGGLE_TIMETABLE_ORIENTATION,
    payload: null,
  };
}

export const TOGGLE_TITLE_DISPLAY = 'TOGGLE_TITLE_DISPLAY';
export function toggleTitleDisplay(): FSA {
  return {
    type: TOGGLE_TITLE_DISPLAY,
    payload: null,
  };
}
