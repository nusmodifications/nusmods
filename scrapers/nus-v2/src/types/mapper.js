// @flow

/**
 * Intermediate shapes used during transformation between types from api.js
 * to modules.js
 */

import type { ModuleInfo } from './api';

/**
 * Module info with the AcademicGroup and AcademicOrg mapped to the actual
 * faculty and department
 */
export type ModuleInfoMapped = {
  ...ModuleInfo,
  AcademicGroup: string,
  AcademicOrganisation: string,
};

export type FacultyCodeMap = { [code: string]: string };
export type DepartmentCodeMap = { [code: string]: string };
