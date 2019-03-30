// it appears on the list for the semester
import { Semester } from './modules';

// The year, semester the module will be taken in, and the order
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
