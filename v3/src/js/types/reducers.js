// @flow
import type {
  Faculty,
  Lesson,
  ModuleCode,
  ModuleCondensed,
  Semester,
} from 'types/modules';

/* app.js */
export type AppState = {
  activeSemester: Semester,
  activeLesson: ?Lesson,
  activeModule: ?ModuleCode,
};

/* requests.js */
export type RequestType = string;

export type FetchRequest = {
  isPending: boolean,
  isSuccessful: boolean,
  isFailure: boolean,
  error?: any,
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
export type ModuleCodeMap = { [ModuleCode]: ModuleCondensed };

/* module-finder.js */
export type ModuleSearch = {
  term: string,
  tokens: string[],
};

export type ModuleFinderState = {
  search: ModuleSearch,
}
