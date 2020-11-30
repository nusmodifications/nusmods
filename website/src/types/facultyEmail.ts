import { Department, Faculty, ModuleCode } from './modules';

export type Division = 'undergrad' | 'grad';

// Each of these match config declaratively matches an email address to a module
export interface ModuleCodeMatch {
  type: 'moduleCode';
  moduleCode: ModuleCode | ModuleCode[];
}

export interface ModuleCodePrefixMatch {
  type: 'modulePrefix';
  prefix: string;
}

export interface DepartmentMatch {
  type: 'department';
  department: Department;
  level: Division;
}

export interface FacultyMatch {
  type: 'faculty';
  faculty: Faculty;
  level: Division;
}

export type ModuleMatch = ModuleCodeMatch | ModuleCodePrefixMatch | DepartmentMatch | FacultyMatch;

export interface FacultyEmail<M extends ModuleMatch = ModuleMatch> {
  id: string;
  label: string;
  email: string;
  // Declarative config to match modules to this specific email
  match: M;
}
