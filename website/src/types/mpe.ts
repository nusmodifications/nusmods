import { ModuleTitle, ModuleCode } from './modules';

export interface EssentialMajor {
  type: "01"
}

export interface EssentialSecondMajor {
  type: "02"
}

export interface Elective {
  type: "03"
}

export interface UnrestrictedElective {
  type: "04"
}

export type ModuleType =
  | EssentialMajor
  | EssentialSecondMajor
  | Elective
  | UnrestrictedElective;

export type MpePreference = {
  moduleTitle?: ModuleTitle;
  moduleCode: ModuleCode;
  moduleType: ModuleType;
  moduleCredits: number;
};
