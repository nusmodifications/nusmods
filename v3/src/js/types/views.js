// @flow
import FilterGroup from 'utils/filters/FilterGroup';
import type { AcadYear, Faculty } from './modules';

/* components/ModulesSelect.jsx */
export type SelectOption = { label: string, value: string };

/* settings/SettingsContainer.jsx */
export type Theme = {
  id: string,
  name: string,
};

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

/* components/CorsStats */

export type StudentType = number;
export const NEW_STUDENT = 1;
export const RETURNING_STUDENT = 2;
export const GENERAL_ACCOUNT = 4;

// Simplified version of BiddingStat
export type GroupedBiddingStat = {
  AcadYear: AcadYear,
  Faculty: Faculty,
  Semester: string,
  StudentAcctType: string,
  Round: string,
  Quota: number,
  Bidders: number,
  LowestSuccessfulBid: number,
};

export type BiddingSummary = {
  [Faculty]: {
    [StudentType]: {
      minBid: number,
      round: string,
    },
  }
};

export type SemesterStats = {
  quota: number,
  bids: number,
  faculties: Set<Faculty>,
  stats: GroupedBiddingStat[],
  summary: BiddingSummary,
};
