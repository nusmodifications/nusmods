// @flow
import FilterGroup from 'utils/filters/FilterGroup';
import type {
  Department,
  Faculty,
  Lesson,
  Module,
  ModuleCode,
  ModuleCondensed,
  ModuleWithColor,
  Semester,
  TreeFragment,
} from './modules';
import type { CustomModule, ModuleList } from './reducers';
import type { NextBusTimings, Venue, VenueList } from './venues';

export type ComponentMap = {|
  globalSearchInput: ?HTMLInputElement,
  downloadButton: ?HTMLButtonElement,
|};

/* layout/GlobalSearch */
export type ResultType = 'VENUE' | 'MODULE' | 'SEARCH';
export const VENUE_RESULT = 'VENUE';
export const MODULE_RESULT = 'MODULE';
export const SEARCH_RESULT = 'SEARCH';

export type SearchResult = {|
  +modules: ModuleList,
  +venues: VenueList,
  +tokens: string[],
|};

// Flow doesn't accept tuple disjoint unions https://github.com/facebook/flow/issues/4296
export type SearchItem =
  | {| +type: 'VENUE', +venue: Venue |}
  | {| +type: 'MODULE', +module: ModuleCondensed |}
  | {| +type: 'SEARCH', +result: 'MODULE' | 'VENUE', +term: string |};

/* browse/ModuleFinderContainer */
export type FilterGroupId = string;

export type OnFilterChange = (FilterGroup<*>) => any;
export type FilterGroups = { [FilterGroupId]: FilterGroup<any> };
export type DepartmentFaculty = { [Department]: Faculty };

export type PageRange = {|
  +current: number,
  +start: number, // The first page shown, zero indexed
  +loaded: number, // The number of pages loaded
|};

export type PageRangeDiff = {
  // Start and pages are ADDED to the previous state
  start?: number,
  loaded?: number,

  // Current page is SET
  current?: number,
};

export type OnPageChange = (PageRangeDiff) => void;

export type DisqusConfig = {|
  +identifier: string,
  +url: string,
  +title: string,
|};

export type ModuleTableOrder = 'exam' | 'mc' | 'code';

export type SelectedLesson = {| date: Date, lesson: Lesson |};

export type ExamClashes = { [string]: Module[] };

// Incomplete typing of Mamoto's API. If you need something not here, feel free
// to declare the typing here.
// Full list: https://developer.matomo.org/api-reference/tracking-javascript
export type Tracker = {
  /**
   * Using the Tracker Object
   */
  // Logs an event with an event category (Videos, Music, Games...),
  // an event action (Play, Pause, Duration, Add Playlist, Downloaded, Clicked...),
  // and an optional event name and optional numeric value.
  trackEvent: (category: string, action: string, name?: string, value?: number) => void,

  // Logs a visit to this page
  trackPageView: (pageTitle?: string) => void,

  // Log an internal site search for a specific keyword, in an optional category,
  // specifying the optional count of search results in the page.
  trackSiteSearch: (keyword: string, category?: string, resultsCount?: number) => void,

  // Manually log a conversion for the numeric goal ID, with an optional numeric
  // custom revenue customRevenue.
  trackGoal: (idGoal: string, customRevenue?: number) => void,

  // Manually log a click from your own code. url is the full URL which is to be
  // tracked as a click. linkType can either be 'link' for an outlink or 'download' for a download.
  trackLink: (url: string, linkType: 'link' | 'download') => void,

  trackAllContentImpressions: () => void,
  trackVisibleContentImpressions: (checkOnScroll: boolean, timeIntervalInMs: number) => void,

  // Scans the given DOM node and its children for content blocks and tracks an
  // impression for them if no impression was already tracked for it.
  trackContentImpressionsWithinNode: (domNode: Element) => void,

  enableHeartBeatTimer: (delayInSeconds: number) => void,
  enableCrossDomainLinking: () => void,
  setCrossDomainLinkingTimeout: (timeout: number) => void,

  setCustomDimension: (
    customDimensionId: number,
    customDimensionValue: string | number | boolean,
  ) => void,

  /**
   * Managing Consent
   */
  // By default the Matomo tracker assumes consent to tracking. To change this behavior
  // so nothing is tracked until a user consents, you must call requireConsent.
  requireConsent: () => void,

  // Marks that the current user has consented. The consent is one-time only, so in a
  // subsequent browser session, the user will have to consent again. To remember consent,
  // see the method below: rememberConsentGiven.
  setConsentGiven: () => void,

  // Marks that the current user has consented, and remembers this consent through a
  // browser cookie. The next time the user visits the site, Matomo will remember that
  // they consented, and track them. If you call this method, you do not need to
  // call setConsentGiven.
  rememberConsentGiven: (hoursToExpire: number) => void,

  // Removes a user's consent, both if the consent was one-time only and if the consent was
  // remembered. After calling this method, the user will have to consent again in order to be tracked.
  forgetConsentGiven: () => void,
};

export type TimeSegment = 'Morning' | 'Afternoon' | 'Evening';
export const TIME_SEGMENTS = ['Morning', 'Afternoon', 'Evening'];

export type ModuleWithExamTime = {|
  +module: ModuleWithColor,
  +dateTime: string,
  +date: string,
  +time: string,
  +timeSegment: TimeSegment,
|};

/* views/today */
export type EmptyGroupType =
  | 'winter'
  | 'summer'
  | 'orientation'
  | 'weekend'
  | 'holiday'
  | 'recess'
  | 'reading';

/* views/planner */
export type PrereqConflict = {
  type: 'prereq',
  unfulfilledPrereqs: Array<TreeFragment>,
};

export type ExamConflict = {
  type: 'exam',
  conflictModules: ModuleCode[],
};

export type SemesterConflict = {
  type: 'semester',
  semestersOffered: Semester[],
};

export type NoInfo = {
  type: 'noInfo',
};

export type Conflict = PrereqConflict | ExamConflict | SemesterConflict | NoInfo;

export type PlannerModuleInfo = {|
  moduleCode: ModuleCode,
  moduleInfo?: ?Module,
  // Custom info added by the student to override our data or to fill in the blanks
  // This is a separate field for easier typing
  customInfo?: ?CustomModule,
  conflict?: ?Conflict,
|};

export type PlannerModulesWithInfo = {
  // Mapping acad years to a map of semester to module information object
  // This is the form used by the UI
  +[string]: {|
    +[Semester]: PlannerModuleInfo,
  |},
};

export type BusTiming = {|
  // Loading uses a boolean instead of making timings null so that
  // the old timing can be seen while it is refreshed
  isLoading: boolean,
  timings: ?NextBusTimings,
  error: ?Error,
|};
