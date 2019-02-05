// @flow
import type {
  Faculty,
  Lesson,
  ModuleCode,
  ModuleCondensed,
  SearchableModule,
  Semester,
} from 'types/modules';
import type { Mode } from 'types/settings';
import type { TimetableConfig } from 'types/timetables';
import type { ModuleTableOrder } from 'types/views';

/* app.js */
export type NotificationOptions = {
  // Amount of time in ms for the notification to be shown, not including opening
  // and closing animation
  // Default: a non-zero, non-infinity value - currently 2750ms.
  +timeout?: number,

  // By default any notification that comes in when there is already a notification
  // shown will be queued behind the current one. If the notification is not too important,
  // or we expect a large number to be generated in a short period of time, we allow the
  // current notification to be overwritten by the new one.
  // Default behavior: false
  +overwritable?: boolean,

  // If `priority` is true, the new notification pushes aside the queue and the currently displayed
  // notification, and is displayed immediately. Like this: https://youtu.be/Iimj0j4NYME
  // `overwritable` behavior is prioritized over `priority`; an overwritable priority notification
  // will be discarded if a non-overwritable notification is opened.
  // Default behavior: false
  +priority?: boolean,

  +action?: {
    +text: string,
    +handler: () => ?boolean, // Return false to disable notification auto-close
  },

  // This function will be called when the notification is about to be closed,
  // just before animation starts (i.e. just before state transitions to Closing).
  // `discarded`: if false, notification will be displayed again.
  // `actionClicked`: whether the action button was clicked while the notification was displayed
  +willClose?: (discarded: boolean, actionClicked: boolean) => void,
};

export type NotificationData = { +message: string } & NotificationOptions;

export type AppState = {
  +activeSemester: Semester,
  +activeLesson: ?Lesson,
  +isOnline: boolean,
  +isFeedbackModalOpen: boolean,
  +notifications: NotificationData[],
  +promptRefresh: boolean,
};

/* requests.js */
export type RequestKey = string;

export type ApiStatus = '_REQUEST' | '_SUCCESS' | '_FAILURE';
export const REQUEST = '_REQUEST';
export const SUCCESS = '_SUCCESS';
export const FAILURE = '_FAILURE';

export type FetchRequest = {
  status: ApiStatus,
  error?: any,
};

export type Requests = { [RequestKey]: FetchRequest };

/* theme.js */
export type TimetableOrientation = 'HORIZONTAL' | 'VERTICAL';
export const VERTICAL: TimetableOrientation = 'VERTICAL';
export const HORIZONTAL: TimetableOrientation = 'HORIZONTAL';

export type ThemeState = {
  +id: string,
  +timetableOrientation: TimetableOrientation,
  +showTitle: boolean,
};

/* settings */
export type CorsNotificationSettings = {
  +enabled: boolean,
  +semesterKey: string,
  +dismissed: string[],
};

export type SettingsState = {
  +newStudent: boolean,
  +faculty: ?Faculty,
  +mode: Mode,
  +hiddenInTimetable: ModuleCode[],
  +corsNotification: CorsNotificationSettings,
  +moduleTableOrder: ModuleTableOrder,
  +beta?: boolean,
};

/* timetables.js */
export type ColorIndex = number;

// Mapping of module to color index [0, NUM_DIFFERENT_COLORS)
export type ColorMapping = { [ModuleCode]: ColorIndex };
export type SemesterColorMap = { [Semester]: ColorMapping };
export type HiddenModulesMap = { [Semester]: ModuleCode[] };

export type TimetablesState = {
  +lessons: TimetableConfig,
  +colors: SemesterColorMap,
  +hidden: HiddenModulesMap,
  +academicYear: string,
  // Mapping of academic year to old timetable config
  +archive: { [string]: TimetableConfig },
};

/* moduleBank.js */
export type ModuleSelectListItem = SearchableModule & {
  +isAdded: boolean,
  +isAdding: boolean,
};
export type ModuleList = ModuleCondensed[];
export type ModuleSelectList = ModuleSelectListItem[];
export type ModuleCodeMap = { [ModuleCode]: ModuleCondensed };

/* venueBank.js */
// VenueList is defined in venues.js

/* moduleFinder.js */
export type ModuleSearch = {|
  +term: string,
  +tokens: string[],
|};

export type ModuleFinderState = {|
  +search: ModuleSearch,
|};

/* planner.js */
// The year, semester the module will be taken in, and the order
// it appears on the list for the semester
export type ModuleTime = [string, Semester, number];

export type CustomModule = {
  // For modules which the school no longer offers, we let students
  // key in the name and MCs manually
  +title?: string,
  +moduleCredit: number,
};

export type CustomModuleData = {
  [ModuleCode]: CustomModule,
};

// Mapping modules to when they will be taken
export type PlannerState = {|
  +minYear: string,
  +maxYear: string,
  +iblocs: boolean,

  +modules: {
    [ModuleCode]: ModuleTime,
  },

  +custom: CustomModuleData,
|};
