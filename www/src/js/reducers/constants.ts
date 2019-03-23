import { ModuleCodeMap, ModuleList } from 'types/reducers';
import { ModuleArchive, ModulesMap } from './moduleBank';

/** moduleBank constants **/

export type ModuleBank = {
  moduleList: ModuleList;
  modules: ModulesMap;
  moduleCodes: ModuleCodeMap;
  moduleArchive: ModuleArchive;
  apiLastUpdatedTimestamp: string | null;
};
