/**
 * Intermediate shapes used during transformation between types from api.js
 * to modules.js
 */

import { Omit } from './utils';
import { ModuleInfo } from './api';
import { Module, ModuleCode, RawLesson, SemesterData } from './modules';

/**
 * Module info with the AcademicGrp and AcademicOrg mapped to the actual
 * faculty and department
 */
export type ModuleInfoMapped = ModuleInfo & {
  AcademicGroup: string;
  AcademicOrganisation: string;
};

/**
 * Module type with semester-related info removed
 */
export type SemesterModule = Omit<Module, 'SemesterData' | 'PrereqTree' | 'FulfillRequirements'>;

export type SemesterModuleData = Readonly<{
  ModuleCode: ModuleCode;
  Module: SemesterModule;
  SemesterData: SemesterData;
}>;

export type ModuleWithoutTree = Omit<Module, 'PrereqTree'>;

// Intermediate shape used for venue collation
export type LessonWithModuleCode = RawLesson & {
  ModuleCode: ModuleCode;
};

export type ModuleAliases = {
  [moduleCode: string]: Set<ModuleCode>;
};

/**
 * The exam info part of semester data
 */
export type ExamInfo = Readonly<{
  ExamDate: string;
  ExamDuration: number;
}>;

export type ExamInfoMap = Readonly<{
  [moduleCode: string]: ExamInfo;
}>;

/**
 * Used to map faculty and department names to their codes returned by the API
 */
export type FacultyCodeMap = Readonly<{
  [code: string]: string;
}>;
export type DepartmentCodeMap = Readonly<{
  [code: string]: string;
}>;
