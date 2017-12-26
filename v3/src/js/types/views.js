// @flow
import FilterGroup from 'utils/filters/FilterGroup';
import type { Department, Faculty } from './modules';

/* browse/ModuleFinderContainer */
export type FilterGroupId = string;

export type OnFilterChange = FilterGroup<*> => any;
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

export type OnPageChange = PageRangeDiff => void;
