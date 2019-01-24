// @flow

import axios from 'axios';

import config from '../config';
import type {
  AcademicGroup,
  AcademicOrg,
  ModuleExam,
  ModuleInfo,
  TimetableLesson,
} from '../types/api';
import type { ModuleCode } from '../types/modules';
import { AuthError, NotFoundError, UnknownApiError } from './errors';

export type ApiParams = { [key: string]: any };

// Error codes
type STATUS_CODE = string;
const OKAY: STATUS_CODE = '00000';
const AUTH_ERROR: STATUS_CODE = '10000';
const RECORD_NOT_FOUND: STATUS_CODE = '10001';

/**
 * Base API call function. Do not call this directly, instead use one of the provided
 * methods.
 *
 * This function wraps around axios to provide basic configuration such as authentication
 * which all API calls should have, as well as error handling.
 */
async function callApi<Data>(endpoint: string, params: ApiParams): Promise<Data> {
  const url = `${config.baseUrl}/${endpoint}`;
  return axios
    .post(url, params, {
      transformRequest: [(data) => JSON.stringify(data)],
      headers: {
        'X-APP-API': config.appKey,
        'X-STUDENT-API': config.studentKey,
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      const { msg, data, code } = response.data;

      if (response.data.code !== OKAY) {
        let error;

        switch (code) {
          case AUTH_ERROR:
            error = new AuthError(msg);
            break;
          case RECORD_NOT_FOUND:
            error = new NotFoundError(msg);
            break;
          default:
            error = new UnknownApiError(msg);
        }

        error.response = response;
        throw error;
      }

      return data;
    });
}

/**
 * Obtain an array of faculties in the school (aka. academic groups)
 */
export async function getFaculty(): Promise<AcademicGroup[]> {
  return callApi('config/get-acadgroup', {
    eff_status: 'A',
    // % is a wildcard so this function returns everything
    acad_group: '%',
  });
}

/**
 * Obtain an array of departments in the school (aka. academic organizations)
 */
export async function getDepartment(): Promise<AcademicOrg[]> {
  return callApi('config/get-acadorg', {
    eff_status: 'A',
    // % is a wildcard so this function returns everything
    acad_org: '%',
  });
}

/**
 * Get info for a specific module in a specific term.
 *
 * @throws {NotFoundError} If module cannot be found.
 */
export async function getModuleInfo(term: string, moduleCode: ModuleCode): Promise<ModuleInfo> {
  const parts = /^([a-z]+)(.+)$/i.exec(moduleCode);

  if (!parts || parts.length < 2) {
    throw new RangeError(`moduleCode ${moduleCode} does not look like a module code`);
  }

  // catalognbr = Catalog number
  const [subject, catalognbr] = parts;
  const modules = await callApi('module', {
    term,
    subject,
    catalognbr,
  });

  if (modules.length === 0) throw new NotFoundError();
  return modules[0];
}

/**
 * Get all modules corresponding to a specific faculty during a specific term
 */
export async function getFacultyModules(term: string, facultyCode: string) {
  return callApi('module', {
    term,
    acadgroup: facultyCode,
  });
}

/**
 * Get all modules corresponding to a specific department during a specific term
 */
export async function getDepartmentModules(
  term: string,
  departmentCode: string,
): Promise<ModuleInfo[]> {
  return callApi('module', {
    term,
    acadorg: departmentCode,
  });
}

/**
 * Returns every lesson associated with a module in a specific term in one massive
 * array
 */
export async function getModuleTimetable(
  term: string,
  module: ModuleCode,
): Promise<TimetableLesson[]> {
  return callApi('classtt/withdate', {
    term,
    module,
  });
}

/**
 * Get exam info for a specific module
 *
 * @throws {NotFoundError} If the module in question has no exam (or if the information
 *    is not available yet - the API makes no distinction)
 */
export async function getModuleExam(term: string, module: ModuleCode): Promise<ModuleExam> {
  const exams = await callApi('examtt', {
    term,
    module,
  });

  if (exams.length === 0) throw new NotFoundError();
  return exams[0];
}

/**
 * Get exam info on all modules
 *
 * TODO: See if this endpoint will trigger timeout on the actual server
 */
export async function getAllExams(term: string): Promise<ModuleExam[]> {
  return callApi('examtt', {
    term,
    module: '%',
  });
}
