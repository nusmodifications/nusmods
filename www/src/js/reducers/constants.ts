import { ModuleCodeMap, ModuleList } from 'types/reducers';
import { VenueList } from 'types/venues';
import { ModuleArchive, ModulesMap } from './moduleBank';

/** moduleBank types * */

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
