import { Module, ModuleCode, ModuleCondensed, PrereqTree, Semester } from './modules';
import { ModuleList } from './reducers';
import { ColorIndex, HoverLesson, Lesson, ModifiableLesson } from './timetables';
import { Venue, VenueList } from './venues';
import { CustomModule } from './planner';
import { RegPeriod } from '../config';

export type ComponentMap = {
  globalSearchInput: HTMLInputElement | null;
  downloadButton: HTMLButtonElement | null;
};

/* layout/GlobalSearch */
export type ResultType = 'VENUE' | 'MODULE' | 'SEARCH';
export const VENUE_RESULT = 'VENUE';
export const MODULE_RESULT = 'MODULE';
export const SEARCH_RESULT = 'SEARCH';

export type SearchResult = {
  readonly modules: ModuleList;
  readonly venues: VenueList;
  readonly tokens: string[];
};

export type SearchItem =
  | { readonly type: 'VENUE'; readonly venue: Venue }
  | { readonly type: 'MODULE'; readonly module: ModuleCondensed }
  | { readonly type: 'SEARCH'; readonly result: 'MODULE' | 'VENUE'; readonly term: string };

/* browse/ModuleFinderContainer */
export type RefinementItem = { key: string; doc_count?: number; missing?: boolean };
export type RefinementDisplayItem = RefinementItem & { selected: boolean };

export type DisqusConfig = {
  readonly identifier: string;
  readonly url: string;
  readonly title: string;
};

export type SelectedLesson = { date: Date; lesson: Lesson };

export type ExamClashes = { [key: string]: Module[] };

// Timetable event handlers
export type OnModifyCell = (lesson: ModifiableLesson, position: ClientRect) => void;
export type OnHoverCell = (hoverLesson: HoverLesson | null) => void;

// Incomplete typing of Mamoto's API. If you need something not here, feel free
// to declare the typing here.

export type TimeSegment = 'Morning' | 'Afternoon' | 'Evening';
export const TIME_SEGMENTS = ['Morning', 'Afternoon', 'Evening'];

export type ModuleWithColor = Module & {
  colorIndex: ColorIndex;
  hiddenInTimetable: boolean;
};

export type ModuleWithExamTime = {
  readonly module: ModuleWithColor;
  readonly dateTime: string;
  readonly date: string;
  readonly time: string;
  readonly timeSegment: TimeSegment;
};

/* views/today */
export type EmptyGroupType =
  | 'winter'
  | 'summer'
  | 'orientation'
  | 'weekend'
  | 'holiday'
  | 'recess'
  | 'reading';

/* views/notifications/ModRegNotification */
export interface RegPeriodView extends RegPeriod {
  // Augmented for the frontend. The modreg selector maps RegPeriod to this type.
  dismissed: boolean;
}

/* views/planner */
export type PrereqConflict = {
  type: 'prereq';
  unfulfilledPrereqs: readonly PrereqTree[];
};

export type ExamConflict = {
  type: 'exam';
  conflictModules: readonly ModuleCode[];
};

export type SemesterConflict = {
  type: 'semester';
  semestersOffered: readonly Semester[];
};

export type NoInfo = {
  type: 'noInfo';
};

export type Conflict = PrereqConflict | ExamConflict | SemesterConflict | NoInfo;

export type PlannerModuleInfo = {
  moduleCode: ModuleCode;
  moduleInfo?: Module | null;
  // Custom info added by the student to override our data or to fill in the blanks
  // This is a separate field for easier typing
  customInfo?: CustomModule | null;
  conflict?: Conflict | null;
};

export type PlannerModulesWithInfo = {
  // Mapping acad years to a map of semester to module information object
  // This is the form used by the UI
  readonly [year: string]: {
    readonly [semester: string]: PlannerModuleInfo[];
  };
};
