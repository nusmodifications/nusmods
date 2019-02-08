// @flow

/**
 * Intermediate shapes used during transformation between types from api.js
 * to modules.js
 */

import type { ModuleInfo } from './api';
import type { Module, ModuleCode, PrereqTree, RawLesson, SemesterData } from './modules';

/**
 * Module info with the AcademicGrp and AcademicOrg mapped to the actual
 * faculty and department
 */
export type ModuleInfoMapped = {
  ...ModuleInfo,
  AcademicGroup: string,
  AcademicOrganisation: string,
};

/**
 * Module type with semester-related info removed
 */
export type SemesterModule = $Diff<
  Module,
  {
    SemesterData: SemesterData[],
    PrereqTree?: PrereqTree,
    FulfillRequirements?: ModuleCode[],
  },
>;

export type SemesterModuleData = {|
  ModuleCode: ModuleCode,
  Module: SemesterModule,
  SemesterData: SemesterData,
|};

export type ModuleWithoutTree = $Diff<Module, { PrereqTree?: PrereqTree }>;

// Intermediate shape used for venue collation
export type LessonWithModuleCode = {|
  ...RawLesson,
  ModuleCode: ModuleCode,
|};

export type ModuleAliases = {
  [ModuleCode]: Set<ModuleCode>,
};

/**
 * The exam info part of semester data
 */
export type ExamInfo = {
  ExamDate: string,
  ExamDuration: number,
};

export type ExamInfoMap = {
  [ModuleCode]: ExamInfo,
};

/**
 * Used to map faculty and department names to their codes returned by the API
 */
export type FacultyCodeMap = { [code: string]: string };
export type DepartmentCodeMap = { [code: string]: string };
