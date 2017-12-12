// @flow
import FilterGroup from 'utils/filters/FilterGroup';

/* components/ModulesSelect.jsx */
export type SelectOption = { label: string, value: string };

/* browse/ModuleFinderContainer */
export type OnFilterChange = FilterGroup<*> => any;

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
