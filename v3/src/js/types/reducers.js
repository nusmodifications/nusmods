// @flow
import type {
  Faculty,
  Lesson,
  ModuleCode,
  ModuleCondensed,
} from 'types/modules';

/* app.js */
export type AppState = {
  activeLesson: ?Lesson,
  activeModule: ?ModuleCode,
};

/* requests.js */
export type RequestType = string;

export type FetchRequest = {
  isPending: boolean,
  isSuccessful: boolean,
  isFailure: boolean,
};

export type Requests = { [RequestType]: FetchRequest };

/* theme.js */
export type ColorIndex = number;
// Mapping of module to color index [0, NUM_DIFFERENT_COLORS)
export type ColorMapping = { [ModuleCode]: ColorIndex };

export type TimetableOrientation = 'HORIZONTAL' | 'VERTICAL';
export const VERTICAL: TimetableOrientation = 'VERTICAL';
export const HORIZONTAL: TimetableOrientation = 'HORIZONTAL';

export type ThemeState = {
  id: string,
  colors: ColorMapping,
  timetableOrientation: TimetableOrientation,
};

/* settings */
export type SettingsState = {
  newStudent: boolean,
  faculty: ?Faculty,
  hiddenInTimetable: Array<ModuleCode>,
};

/* entities/moduleBank.js */
export type ModuleSelectListItem = {
  label: string,
  value: ModuleCode,
  semesters: Array<number>
};
export type ModuleList = Array<ModuleCondensed>;
export type ModuleSelectList = Array<ModuleSelectListItem>;

/* scrollMenu.js */
export type ScrollMenuId = string;
export type ScrollMenuItemId = string;

export type ScrollMenuItem = {
  id: ScrollMenuItemId,
  label: string,
}

export type ScrollMenu = {
  current: ?ScrollMenuItemId,
  id: ScrollMenuId,
  items: ScrollMenuItem[],
};

export type ScrollMenuState = {
  [ScrollMenuId]: ScrollMenu,
};
