// @flow

import type {
  Lesson,
  ModuleCode,
  ModuleCondensed,
} from 'types/modules';

/* app.js */
export type AppState = {
  activeLesson: ?Lesson,
};

/* requests.js */
export type FetchRequest = {
  isPending?: boolean,
  isSuccessful?: boolean,
  isFailure?: boolean,
};

/* theme.js */
export type ColorIndex = number;
// Mapping of module to color index [0, NUM_DIFFERENT_COLORS)
export type ColorMapping = { [key: ModuleCode]: ColorIndex };

export type ThemeState = {
  id: string,
  colors: ColorMapping,
  timetableOrientation: string,
};

/* entities/moduleBank.js */
export type ModuleSelectListItem = {
  label: string,
  value: ModuleCode,
  semesters: Array<number>
};
export type ModuleList = Array<ModuleCondensed>;
export type ModuleSelectList = Array<ModuleSelectListItem>;
