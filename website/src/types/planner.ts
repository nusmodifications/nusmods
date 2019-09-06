import { Module, ModuleCode, Semester, PrereqTree, ModuleCondensed } from './modules';
import { CustomModule } from './reducers';

export type AddModuleData =
  | { type: 'module'; moduleCode: ModuleCode }
  | { type: 'placeholder'; placeholderId: string };

export interface PlannerPlaceholder {
  id: string;
  name: string;
  modules?: Set<ModuleCode>;
  filter?: (module: ModuleCondensed) => boolean;
}

export type PlaceholderMap = {
  [id: string]: PlannerPlaceholder;
};

export type ExamConflict = {
  type: 'exam';
  conflictModules: ModuleCode[];
};

export type SemesterConflict = {
  type: 'semester';
  semestersOffered: readonly Semester[];
};

export type NoInfo = {
  type: 'noInfo';
};

export type Conflict = PrereqConflict | ExamConflict | SemesterConflict | NoInfo;

export type PlannerModulesWithInfo = {
  // Mapping acad years to a map of semester to module information object
  // This is the form used by the UI
  readonly [year: string]: {
    readonly [semester: string]: PlannerModuleInfo[];
  };
};

export type PlannerModuleInfo = {
  id: string;
  moduleInfo?: Module | null;
  // Custom info added by the student to override our data or to fill in the blanks
  // This is a separate field for easier typing
  customInfo?: CustomModule | null;
  conflict?: Conflict | null;
  moduleCode?: ModuleCode;
  placeholder?: PlannerPlaceholder;
};

export type PrereqConflict = {
  type: 'prereq';
  unfulfilledPrereqs: PrereqTree[];
};
