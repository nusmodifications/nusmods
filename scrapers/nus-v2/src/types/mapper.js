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

/**
 * Used to map faculty and department names to their codes returned by the API
 */
export type FacultyCodeMap = { [code: string]: string };
export type DepartmentCodeMap = { [code: string]: string };
