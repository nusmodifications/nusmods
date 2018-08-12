// @flow
import FilterGroup from 'utils/filters/FilterGroup';
import type { Department, Faculty } from './modules';
import type { ModuleList } from './reducers';
import type { VenueList } from './venues';

export type ComponentMap = {|
  globalSearchInput: ?HTMLInputElement,
  downloadButton: ?HTMLButtonElement,
|};

/* layout/GlobalSearch */
export type ResultType = 'VENUE' | 'MODULE' | 'SEARCH';
export const VENUE_RESULT: ResultType = 'VENUE';
export const MODULE_RESULT: ResultType = 'MODULE';
export const SEARCH_RESULT: ResultType = 'SEARCH';

export type SearchResult = {
  modules: ModuleList,
  venues: VenueList,
  tokens: string[],
};

/* browse/ModuleFinderContainer */
export type FilterGroupId = string;

export type OnFilterChange = (FilterGroup<*>) => any;
export type FilterGroups = { [FilterGroupId]: FilterGroup<any> };
export type DepartmentFaculty = { [Department]: Faculty };

export type PageRange = {
  current: number,
  start: number, // The first page shown, zero indexed
  loaded: number, // The number of pages loaded
};

export type PageRangeDiff = {
  // Start and pages are ADDED to the previous state
  start?: number,
  loaded?: number,

  // Current page is SET
  current?: number,
};

export type OnPageChange = (PageRangeDiff) => void;

export type DisqusConfig = {
  identifier: string,
  url: string,
  title: string,
};

export type ModuleTableOrder = 'exam' | 'mc' | 'code';
