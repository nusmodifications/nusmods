import { Mode } from './settings';
import { ColorIndex, Lesson, TimetableConfig } from './timetables';
import {
  Faculty,
  Module,
  ModuleCode,
  ModuleCondensed,
  SearchableModule,
  Semester,
} from './modules';
import { CustomModuleData, ModuleTime } from './planner';
import { VenueList } from './venues';

/* app.js */
export type NotificationOptions = {
  // Amount of time in ms for the notification to be shown, not including opening
  // and closing animation
  // Default: a non-zero, non-infinity value - currently 2750ms.
  readonly timeout?: number;

  // By default any notification that comes in when there is already a notification
  // shown will be queued behind the current one. If the notification is not too important,
  // or we expect a large number to be generated in a short period of time, we allow the
  // current notification to be overwritten by the new one.
  // Default behavior: false
  readonly overwritable?: boolean;

  // If `priority` is true, the new notification pushes aside the queue and the currently displayed
  // notification, and is displayed immediately. Like this: https://youtu.be/Iimj0j4NYME
  // `overwritable` behavior is prioritized over `priority`; an overwritable priority notification
  // will be discarded if a non-overwritable notification is opened.
  // Default behavior: false
  readonly priority?: boolean;

  readonly action?: {
    readonly text: string;
    readonly handler: () => boolean | null | void; // Return false to disable notification auto-close
  };

  // This function will be called when the notification is about to be closed,
  // just before animation starts (i.e. just before state transitions to Closing).
  // `discarded`: if false, notification will be displayed again.
  // `actionClicked`: whether the action button was clicked while the notification was displayed
  readonly willClose?: (discarded: boolean, actionClicked: boolean) => void;
};

export type NotificationData = { readonly message: string } & NotificationOptions;

export type AppState = {
  readonly activeSemester: Semester;
  readonly activeLesson: Lesson | null;
  readonly isOnline: boolean;
  readonly isFeedbackModalOpen: boolean;
  readonly notifications: NotificationData[];
  readonly promptRefresh: boolean;
};

/* requests.js */
export type RequestKey = string;

export type ApiStatus = '_REQUEST' | '_SUCCESS' | '_FAILURE';
export const REQUEST = '_REQUEST';
export const SUCCESS = '_SUCCESS';
export const FAILURE = '_FAILURE';

export type FetchRequest = {
  status: ApiStatus;
  error?: any;
};

export type Requests = { [requestKey: string]: FetchRequest };

/* theme.js */
export type TimetableOrientation = 'HORIZONTAL' | 'VERTICAL';
export const VERTICAL: TimetableOrientation = 'VERTICAL';
export const HORIZONTAL: TimetableOrientation = 'HORIZONTAL';

export type ThemeState = Readonly<{
  id: string;
  timetableOrientation: TimetableOrientation;
  showTitle: boolean;
}>;

/* settings */
export type CorsNotificationSettings = {
  readonly enabled: boolean;
  readonly semesterKey: string;
  readonly dismissed: string[];
};

export type ModuleTableOrder = 'exam' | 'mc' | 'code';

export type SettingsState = {
  readonly newStudent: boolean;
  readonly faculty: Faculty | null;
  readonly mode: Mode;
  readonly hiddenInTimetable: ModuleCode[];
  readonly corsNotification: CorsNotificationSettings;
  readonly moduleTableOrder: ModuleTableOrder;
  readonly beta?: boolean;
  readonly loadDisqusManually: boolean;
};

/* timetables.js */

// Mapping of module to color index [0, NUM_DIFFERENT_COLORS)
export type ColorMapping = { [moduleCode: string]: ColorIndex };
export type SemesterColorMap = { [semester: string]: ColorMapping };
export type HiddenModulesMap = { [semester: string]: ModuleCode[] };

export type TimetablesState = {
  readonly lessons: TimetableConfig;
  readonly colors: SemesterColorMap;
  readonly hidden: HiddenModulesMap;
  readonly academicYear: string;
  // Mapping of academic year to old timetable config
  readonly archive: { [key: string]: TimetableConfig };
};

/* venueBank.js */
// VenueList is defined in venues.js

/* planner.js */
// Also see moduleReducers.ts

// Mapping modules to when they will be taken
export type PlannerState = {
  readonly minYear: string;
  readonly maxYear: string;
  readonly iblocs: boolean;

  readonly modules: {
    [moduleCode: string]: ModuleTime;
  };

  readonly custom: CustomModuleData;
};

/* moduleBank.js */
export type ModuleSelectListItem = SearchableModule & {
  readonly isAdded: boolean;
  readonly isAdding: boolean;
};

/* moduleFinder.js */
export type ModuleSearch = {
  readonly term: string;
  readonly tokens: string[];
};

export type ModuleFinderState = {
  readonly search: ModuleSearch;
};
export type ModuleList = ModuleCondensed[];
export type ModuleSelectList = ModuleSelectListItem[];
export type ModuleCodeMap = { [moduleCode: string]: ModuleCondensed };
export type ModuleArchive = {
  [moduleCode: string]: {
    // Mapping acad year to module info
    [key: string]: Module;
  };
};

/**
 * moduleBank types
 */
export type ModulesMap = {
  [moduleCode: string]: Module;
};
export type ModuleBank = {
  moduleList: ModuleList;
  modules: ModulesMap;
  moduleCodes: ModuleCodeMap;
  moduleArchive: ModuleArchive;
  apiLastUpdatedTimestamp: string | null;
};

/**
 * undoHistory types
 */
export type UndoHistoryState = {
  past: Record<string, any>[];
  present: Record<string, any> | undefined;
  future: Record<string, any>[];
};

/**
 * venueBank types
 */
export type VenueBank = {
  readonly venueList: VenueList;
};
