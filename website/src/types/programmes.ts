import { ModuleCode } from './modules';

export type ProgrammeType = 'specialisation' | 'focusArea' | 'minor';

// Matchers are declarative (no functions) so that programme data remains
// serializable and can move to the API or a JSON dataset without changes.
export type ModuleMatcher =
  | { kind: 'modules'; codes: readonly ModuleCode[] }
  | { kind: 'prefix'; prefixes: readonly string[]; minLevel?: number; maxLevel?: number };

export type ProgrammeRequirement = {
  // Unique within the programme
  id: string;
  name: string;
  // Minimum MCs this requirement needs to be satisfied
  minMCs?: number;
  // Minimum number of modules this requirement needs to be satisfied
  minModules?: number;
  // A module fulfils this requirement if it matches ANY of these matchers.
  // A requirement with no minMCs and no minModules is an elective pool —
  // always satisfied, but matching modules still count towards the
  // programme's total MCs.
  matchers: ModuleMatcher[];
  description?: string;
};

export type Programme = {
  // Globally unique and stable — persisted in PlannerState
  id: string;
  name: string;
  type: ProgrammeType;
  faculty: string;
  // Minimum total MCs for the programme, if it has an MC floor. Programmes
  // such as CS focus areas are defined purely in terms of module counts.
  totalMCs?: number;
  requirements: ProgrammeRequirement[];
  // Official page this data was transcribed from
  source: string;
  // ISO date the data was last checked against source
  lastVerified: string;
  // Cohorts these requirements apply to, e.g. 'AY2021/22 and after'
  cohort?: string;
};

export type ProgrammeMap = {
  [id: string]: Programme;
};

// Output of the requirement fulfilment check in utils/programmes.ts

export type RequirementFulfilment = {
  requirement: ProgrammeRequirement;
  assignedModules: ModuleCode[];
  fulfilledMCs: number;
  satisfied: boolean;
};

export type ProgrammeFulfilment = {
  programme: Programme;
  requirements: RequirementFulfilment[];
  // Total MCs of all planned modules counting towards this programme
  totalMCs: number;
  satisfied: boolean;
};
