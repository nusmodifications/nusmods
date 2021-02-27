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
  // List of ModuleCondensed for searching
  moduleList: (data: ModuleCondensed[]) => Promise<void>;

  // List of partial module info for module finder
  moduleInfo: (data: ModuleInformation[]) => Promise<void>;

  // List of MPE module info for NUS's module planning exercise
  mpeModules: (data: MPEModule[]) => Promise<void>;

  // DEPRECATED. TODO: Remove after AY19/20 starts.
  // List of partial module info for module finder
  moduleInformation: (data: ModuleInformation[]) => Promise<void>;

  // Mapping modules to other dual coded modules
  moduleAliases: (data: Aliases) => Promise<void>;

  // List of faculties and their departments
  facultyDepartments: (data: { [faculty: string]: string[] }) => Promise<void>;

  // Per module information

  // Output for a specific module's data
  module: (moduleCode: ModuleCode, data: Module) => Promise<void>;

  getModuleCodes: () => Promise<ModuleCode[]>;

  deleteModule: (moduleCode: ModuleCode) => Promise<void>;

  // Per semester information

  // List of venue codes used for searching
  venueList: (semester: Semester, data: Venue[]) => Promise<void>;

  // List of venues mapped to their availability
  venueInformation: (semester: Semester, data: VenueInfo) => Promise<void>;

  timetable: (semester: Semester, moduleCode: ModuleCode, data: RawLesson[]) => Promise<void>;

  semesterData: (semester: Semester, moduleCode: ModuleCode, data: SemesterData) => Promise<void>;
}

/**
 * Object representing a unique cache file on disk
 */
export interface Cache<T> {
  path: string;
  write: (data: T) => Promise<void>;
  read: () => Promise<T>;
}
