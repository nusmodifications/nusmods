// @flow

/**
 * Intermediate shapes used during transformation between types from api.js
 * to modules.js
 */

import type { ModuleInfo } from './api';
import type { Module, ModuleCode, SemesterData, TreeFragment } from './modules';

/**
 * Module info with the AcademicGroup and AcademicOrg mapped to the actual
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
    History: Array<SemesterData>,
    ModmavenTree: TreeFragment,
    LockedModules?: Array<ModuleCode>,
  },
>;

export type SemesterModuleData = {|
  ModuleCode: ModuleCode,
  Module: SemesterModule,
  SemesterData: SemesterData,
|};

export type ModuleWithoutTree = $Diff<Module, { ModmavenTree: TreeFragment }>;

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
