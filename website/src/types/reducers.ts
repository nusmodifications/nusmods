import { AxiosError } from 'axios';
import { RegPeriodType, ScheduleType } from 'config';

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
  readonly customiseModule: ModuleCode;
  readonly isOnline: boolean;
  readonly isFeedbackModalOpen: boolean;
  readonly notifications: NotificationData[];
  readonly promptRefresh: boolean;
};

/* requests.js */
export type RequestKey = string;

export type ApiStatus = '_REQUEST' | '_SUCCESS' | '_FAILURE';
export const REQUEST = '_REQUEST' as const;
export const SUCCESS = '_SUCCESS' as const;
export const FAILURE = '_FAILURE' as const;

export type FetchRequest = {
  status: ApiStatus;
  error?: AxiosError;
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
export type ModRegRoundKey = { type: RegPeriodType; name?: string };

export type ModRegNotificationSettings = {
  readonly enabled: boolean;
  readonly semesterKey: string;
  readonly dismissed: ModRegRoundKey[];
  readonly scheduleType: ScheduleType;
};

export type ModuleTableOrder = 'exam' | 'mc' | 'code';

export type SettingsState = {
  readonly newStudent: boolean;
  readonly faculty: Faculty | null;
  readonly mode: Mode;
  readonly hiddenInTimetable: ModuleCode[];
  readonly modRegNotification: ModRegNotificationSettings;
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
// The year, semester the module will be taken in, and the order
// it appears on the list for the semester
export type PlannerTime = {
  // The key in PlannerState.modules
  id: string;

  // The year, semester and zero-indexed position of the module in the planner
  year: string;
  semester: Semester;
  index: number;

  // Technically this should be { moduleCode } | { moduleCode?, placeholderId }
  // that is, it should either have a placeholder ID and maybe a module code
  // or a module code, but because TS handles union types poorly we're just
  // merging the two here
  moduleCode?: ModuleCode;
  placeholderId?: string;
};

export type CustomModule = {
  // For modules which the school no longer offers, we let students
  // key in the name and MCs manually
  readonly title?: string | null;
  readonly moduleCredit: number;
};

export type CustomModuleData = {
  [moduleCode: string]: CustomModule;
};

// Mapping modules to when they will be taken
export type PlannerState = Readonly<{
  minYear: string;
  maxYear: string;
  iblocs: boolean;
  ignorePrereqCheck?: boolean; // To turn checking of prerequisites on/off

  modules: { [id: string]: PlannerTime };
  custom: CustomModuleData;
}>;

/* moduleBank.js */
export type ModuleSelectListItem = SearchableModule & {
  readonly isAdded: boolean;
  readonly isAdding: boolean;
};
export type ModuleList = ModuleCondensed[];
export type ModuleSelectList = ModuleSelectListItem[];
export type ModuleCodeMap = { [moduleCode: string]: ModuleCondensed };
export type ModuleArchive = {
  [moduleCode: string]: {
    // Mapping acad year to module info
    [acadYear: string]: Module;
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
export type UndoHistoryState<T extends { undoHistory: UndoHistoryState<T> }> = {
  past: Partial<T>[];
  present: Partial<T> | undefined;
  future: Partial<T>[];
};

/**
 * venueBank types
 */
export type VenueBank = {
  readonly venueList: VenueList;
};
