import { Module } from 'types/modules';
import { ModuleCodeMap, ModuleList } from 'types/moduleReducers';
import { VenueList } from 'types/venues';

/** moduleBank types * */

export type ModulesMap = {
  [moduleCode: string]: Module;
};

export type ModuleArchive = {
  [moduleCode: string]: {
    // Mapping acad year to module info
    [key: string]: Module;
  };
};

export type ModuleBank = {
  moduleList: ModuleList;
  modules: ModulesMap;
  moduleCodes: ModuleCodeMap;
  moduleArchive: ModuleArchive;
  apiLastUpdatedTimestamp: string | null;
};

/** undoHistory types * */

export type UndoHistoryState = {
  past: Record<string, any>[];
  present: Record<string, any> | undefined;
  future: Record<string, any>[];
};

/** venueBank types * */

export type VenueBank = {
  readonly venueList: VenueList;
};
