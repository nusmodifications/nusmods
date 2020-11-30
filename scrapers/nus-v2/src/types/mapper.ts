/**
 * Intermediate shapes used during transformation between types from api.js
 * to modules.js
 */

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
export type SemesterModule = Omit<Module, 'semesterData' | 'prereqTree' | 'fulfillRequirements'>;

export type WritableSemesterModuleData = {
  moduleCode: ModuleCode;
  module: SemesterModule;
  semesterData?: SemesterData;
};

export type SemesterModuleData = Readonly<WritableSemesterModuleData>;

export type ModuleWithoutTree = Omit<Module, 'prereqTree'>;

// Intermediate shape used for venue collation
export type LessonWithModuleCode = RawLesson & {
  moduleCode: ModuleCode;
};

export type ModuleAliases = {
  [moduleCode: string]: Set<ModuleCode>;
};

/**
 * The exam info part of semester data
 */
export type ExamInfo = Readonly<{
  examDate: string;
  examDuration: number;
}>;

export type ExamInfoMap = Readonly<{
  [moduleCode: string]: ExamInfo;
}>;

/**
 * Used to map faculty and department names to their codes returned by the API
 */
export type FacultyCodeMap = Readonly<{ [code: string]: string }>;
export type DepartmentCodeMap = Readonly<{ [code: string]: string }>;
