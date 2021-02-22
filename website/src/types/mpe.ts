import { ModuleTitle, ModuleCode } from './modules';

export type MpePreference = {
  moduleTitle?: ModuleTitle;
  moduleCode: ModuleCode;
  moduleType: '01' | '02' | '03' | '04';
  moduleCredits: number;
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
