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
  // Amount of time in ms for the notification to be shown, not including opening
  // and closing animation
  timeout?: number,

  // By default any notification that comes in when there is already a notification
  // shown will be queued behind the current one. If the notification is not too important,
  // or we expect a large number to be generated in a short period of time, we allow the
  // current notification to be overwritten by the new one
  overwritable?: boolean,

  action?: {
    text: string,
    handler: Function,
  },
};

export type NotificationData = { message: string } & NotificationOptions;

export type AppState = {
  activeSemester: Semester,
  activeLesson: ?Lesson,
  isOnline: boolean,
  isFeedbackModalOpen: boolean,
  notifications: NotificationData[],
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
