// @flow
import type {
  Faculty,
  Lesson,
  ModuleCode,
  SearchableModule,
  ModuleCondensed,
  Semester,
} from 'types/modules';
import type { Mode } from 'types/settings';

/* app.js */

export type NotificationOptions = {
  timeoutInMs?: number,
  action?: {
    text: string,
    handler: Function,
  },
  multiline?: boolean,
};

export type NotificationData = { message: string } & NotificationOptions;

export type AppState = {
  activeSemester: Semester,
  activeLesson: ?Lesson,
  isOnline: boolean,
  isFeedbackModalOpen: boolean,
  notification: ?NotificationData,
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
export type CorsNotificationSettings = {
  enabled: boolean,
  semesterKey: string,
  dismissed: string[],
};

export type SettingsState = {
  newStudent: boolean,
  faculty: ?Faculty,
  mode: Mode,
  hiddenInTimetable: ModuleCode[],
  corsNotification: CorsNotificationSettings,
};

/* moduleBank.js */
export type ModuleSelectListItem = SearchableModule & {
  isAdded: boolean,
};
export type ModuleList = ModuleCondensed[];
export type ModuleSelectList = ModuleSelectListItem[];
export type ModuleCodeMap = { [ModuleCode]: ModuleCondensed };

/* venueBank.js */
// VenueList is defined in venues.js

/* moduleFinder.js */
export type ModuleSearch = {
  term: string,
  tokens: string[],
};

export type ModuleFinderState = {
  search: ModuleSearch,
};
