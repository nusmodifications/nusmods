import {
  Faculty,
  Lesson,
  ModuleCode,
  ModuleCondensed,
  SearchableModule,
  Semester,
} from 'types/modules';
import { Mode } from 'types/settings';
import { TimetableConfig } from 'types/timetables';
import { ModuleTableOrder } from 'types/views';

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
export type ColorIndex = number;

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

/* moduleBank.js */
export type ModuleSelectListItem = SearchableModule & {
  readonly isAdded: boolean;
  readonly isAdding: boolean;
};
export type ModuleList = ModuleCondensed[];
export type ModuleSelectList = ModuleSelectListItem[];
export type ModuleCodeMap = { [moduleCode: string]: ModuleCondensed };

/* venueBank.js */
// VenueList is defined in venues.js

/* moduleFinder.js */
export type ModuleSearch = {
  readonly term: string;
  readonly tokens: string[];
};

export type ModuleFinderState = {
  readonly search: ModuleSearch;
};

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

  modules: { [id: string]: PlannerTime };
  custom: CustomModuleData;
}>;
