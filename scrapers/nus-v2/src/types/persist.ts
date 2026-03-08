import {
  Aliases,
  Module,
  ModuleCode,
  ModuleCondensed,
  ModuleInformation,
  RawLesson,
  Semester,
  SemesterData,
} from './modules';
import type { MPEModule } from './mpe';
import { Venue, VenueInfo } from './venues';

/**
 * Interface for API to persist data to disk
 */
export interface Persist {
  deleteModule: (moduleCode: ModuleCode) => Promise<void>;

  // List of faculties and their departments
  facultyDepartments: (data: { [faculty: string]: Array<string> }) => Promise<void>;

  getModuleCodes: () => Promise<Array<ModuleCode>>;

  // Output for a specific module's data
  module: (moduleCode: ModuleCode, data: Module) => Promise<void>;

  // Mapping modules to other dual coded modules
  moduleAliases: (data: Aliases) => Promise<void>;

  // List of partial module info for module finder
  moduleInfo: (data: Array<ModuleInformation>) => Promise<void>;

  // Per module information

  // DEPRECATED. TODO: Remove after AY19/20 starts.
  // List of partial module info for module finder
  moduleInformation: (data: Array<ModuleInformation>) => Promise<void>;

  // List of ModuleCondensed for searching
  moduleList: (data: Array<ModuleCondensed>) => Promise<void>;

  // List of MPE module info for NUS's module planning exercise
  mpeModules: (data: Array<MPEModule>) => Promise<void>;

  // Per semester information

  semesterData: (semester: Semester, moduleCode: ModuleCode, data: SemesterData) => Promise<void>;

  timetable: (semester: Semester, moduleCode: ModuleCode, data: Array<RawLesson>) => Promise<void>;

  // List of venues mapped to their availability
  venueInformation: (semester: Semester, data: VenueInfo) => Promise<void>;

  // List of venue codes used for searching
  venueList: (semester: Semester, data: Array<Venue>) => Promise<void>;
}

/**
 * Object representing a unique cache file on disk
 */
export interface Cache<T> {
  path: string;
  read: () => Promise<T>;
  write: (data: T) => Promise<void>;
}
