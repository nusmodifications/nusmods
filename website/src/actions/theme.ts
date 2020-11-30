export const SELECT_THEME = 'SELECT_THEME' as const;
export function selectTheme(theme: string) {
  return {
    type: SELECT_THEME,
    payload: theme,
  };
}

export const CYCLE_THEME = 'CYCLE_THEME' as const;
export function cycleTheme(offset: number) {
  return {
    type: CYCLE_THEME,
    payload: offset,
  };
}

export const TOGGLE_TIMETABLE_ORIENTATION = 'TOGGLE_TIMETABLE_ORIENTATION' as const;
export function toggleTimetableOrientation() {
  return {
    type: TOGGLE_TIMETABLE_ORIENTATION,
    payload: null,
  };
}

export const TOGGLE_TITLE_DISPLAY = 'TOGGLE_TITLE_DISPLAY' as const;
export function toggleTitleDisplay() {
  return {
    type: TOGGLE_TITLE_DISPLAY,
    payload: null,
  };
}
