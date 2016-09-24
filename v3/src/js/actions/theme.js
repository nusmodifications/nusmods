// @flow

import type { FSA } from 'types/redux';

export const CHANGE_THEME: string = 'CHANGE_THEME';
export function changeTheme(theme: string): FSA {
  return {
    type: CHANGE_THEME,
    payload: {
      theme,
    },
  };
}

export const TOGGLE_TIMETABLE_ORIENTATION: string = 'TOGGLE_TIMETABLE_ORIENTATION';
export function toggleTimetableOrientation(): FSA {
  return {
    type: TOGGLE_TIMETABLE_ORIENTATION,
  };
}
