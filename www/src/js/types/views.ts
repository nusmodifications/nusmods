import FilterGroup from 'utils/filters/FilterGroup';
import { Department, Module, ModuleCondensed } from './modules';
import { ModuleList } from './reducers';
import { ColorIndex, HoverLesson, Lesson, ModifiableLesson } from './timetables';
import { Venue, VenueList } from './venues';

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
export type AnyGroup = FilterGroup<any>;

export type OnFilterChange = (filterGroup: AnyGroup) => unknown;
export type FilterGroups = { [filterGroupId: string]: AnyGroup };
export type FacultyDepartments = { [faculty: string]: Department[] };

export type PageRange = {
  readonly current: number;
  readonly start: number; // The first page shown, zero indexed
  readonly loaded: number; // The number of pages loaded
};

export type PageRangeDiff = {
  // Start and pages are ADDED to the previous state
  start?: number;
  loaded?: number;

  // Current page is SET
  current?: number;
};

export type OnPageChange = (pageRangeDiff: PageRangeDiff) => void;

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
