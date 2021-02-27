import { ModuleTitle, ModuleCode } from './modules';

export type MpePreference = {
  rank?: number;
  moduleTitle?: ModuleTitle;
  moduleCredits?: number;
  moduleCode: ModuleCode;
  moduleType: '01' | '02' | '03' | '04';
};

export type MpeSubmission = {
  nusExchangeId?: string;
  intendedMCs: number;
  preferences: Array<MpePreference>;
};

export type MpeModule = {
  title: ModuleTitle;
  moduleCode: ModuleCode;
  moduleCredit: string;
  inS1MPE?: boolean;
  inS2MPE?: boolean;
};

interface ModuleTypeInfo {
  label: string;
}

export const MODULE_TYPES: Record<MpePreference['moduleType'], ModuleTypeInfo> = {
  '01': {
    label: 'Essential Major',
  },
  '02': {
    label: 'Essential Second Major',
  },
  '03': {
    label: 'Elective',
  },
  '04': {
    label: 'Unrestricted Elective',
  },
};
