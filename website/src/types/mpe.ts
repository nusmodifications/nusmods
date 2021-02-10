import { ModuleCode } from './modules';

interface EssentialMajor {
  kind: '01';
}

interface EssentialSecondMajor {
  kind: '02';
}

interface Elective {
  kind: '03';
}

interface UnrestrictedElective {
  kind: '04';
}

export type ModuleType =
  | EssentialMajor
  | EssentialSecondMajor
  | Elective
  | UnrestrictedElective
  | null;

export type Preference = {
  moduleTitle: string;
  moduleCode: ModuleCode;
  moduleType: ModuleType;
  moduleCredits: string;
};
