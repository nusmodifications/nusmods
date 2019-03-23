import { ModuleCondensed, SearchableModule, Semester } from './modulesBase';

/* moduleBank.js */
export type ModuleSelectListItem = SearchableModule & {
  readonly isAdded: boolean;
  readonly isAdding: boolean;
};
export type ModuleList = ModuleCondensed[];
export type ModuleSelectList = ModuleSelectListItem[];
export type ModuleCodeMap = { [moduleCode: string]: ModuleCondensed };

/* moduleFinder.js */
export type ModuleSearch = {
  readonly term: string;
  readonly tokens: string[];
};

export type ModuleFinderState = {
  readonly search: ModuleSearch;
};

/* planner.js */
// Also see reducers.ts

// The year, semester the module will be taken in, and the order
// it appears on the list for the semester
export type ModuleTime = [string, Semester, number];

export type CustomModule = {
  // For modules which the school no longer offers, we let students
  // key in the name and MCs manually
  readonly title?: string | null;
  readonly moduleCredit: number;
};

export type CustomModuleData = {
  [moduleCode: string]: CustomModule;
};
