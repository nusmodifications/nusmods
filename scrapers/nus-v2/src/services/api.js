// @flow

/**
 * API wrapper that handles calls to the NUS module and class data servers.
 *
 * The default export is a singleton instance of the API class. This allows us
 * to enforce global concurrency limit on the number of requests made.
 *
 * The API class and base callApi functions are exported for testing and
 * should not be used directly.
 */

import axios from 'axios';
import Queue from 'promise-queue';

import type { ModuleCode } from '../types/modules';
import type {
  AcademicGrp,
  AcademicOrg,
  ModuleExam,
  ModuleInfo,
  TimetableLesson,
} from '../types/api';
import config from '../config';
import { AuthError, NotFoundError, UnknownApiError } from '../utils/errors';

type ApiParams = { [key: string]: any };

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
export async function callApi<Data>(endpoint: string, params: ApiParams): Promise<Data> {
  // 1. Construct request URL
  const url = `${config.baseUrl}/${endpoint}`;
  let response;

  try {
    // 2. All API requests use POST HTTP method with params encoded in JSON
    //    in the body
    response = await axios.post(url, params, {
      transformRequest: [(data) => JSON.stringify(data)],
      // 3. Apply authentication using header
      headers: {
        'X-APP-API': config.appKey,
        'X-STUDENT-API': config.studentKey,
        'Content-Type': 'application/json',
      },
    });
  } catch (e) {
    // 4. Handle network / request level errors, eg. server returning non-200
    //    status code
    let message;
    if (e.response) {
      const { status, statusText } = e.response;
      message = `Server returned status ${status} - ${statusText}`;
    } else {
      // If there is no response it usually means the client can't make the HTTP request,
      // possibly because the network is down
      message = `Unknown error - ${e.message}`;
    }

    const error = new UnknownApiError(message);
    error.originalError = e;
    error.response = e.response;
    error.requestConfig = e.config;
    throw error;
  }

  const { msg, data, code } = response.data;

  // 5. Handle application level errors
  if (code !== OKAY) {
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
    error.requestConfig = response.config;
    throw error;
  }

  // 6. No error - return the data
  return data;
}

// Export for testing. Do not instantiate directly, use the singleton instance instead
export class API {
  queue: Queue;

  constructor(concurrency: number) {
    this.queue = new Queue(concurrency, Infinity);
  }

  /**
   * Wrapper around base callApi method that pushes the call into a queue
   */
  callApi = async (endpoint: string, params: ApiParams) =>
    this.queue.add(() => callApi(endpoint, params));

  /**
   * Calls the modules endpoint
   */
  callModulesEndpoint = async (term: string, params: ApiParams) => {
    try {
      // DO NOT remove this await - the promise must settle so the catch
      // can handle the NotFoundError from the API
      return await this.callApi('module', {
        term,
        ...params,
      });
    } catch (e) {
      // The modules endpoint will return NotFound even for valid inputs
      // that just happen to have no records, so we ignore this error
      // and just return an empty array
      if (e instanceof NotFoundError) {
        return [];
      }

      throw e;
    }
  };

  /**
   * Obtain an array of faculties in the school (aka. academic groups)
   */
  getFaculty = async (): Promise<AcademicGrp[]> =>
    this.callApi('config/get-acadgroup', {
      eff_status: 'A',
      // % is a wildcard so this function returns everything
      acad_group: '%',
    });

  /**
   * Obtain an array of departments in the school (aka. academic organizations)
   */
  getDepartment = async (): Promise<AcademicOrg[]> =>
    this.callApi('config/get-acadorg', {
      eff_status: 'A',
      // % is a wildcard so this function returns everything
      acad_org: '%',
    });

  /**
   * Get info for a specific module in a specific term.
   *
   * @throws {NotFoundError} If module cannot be found.
   */
  getModuleInfo = async (term: string, moduleCode: ModuleCode): Promise<ModuleInfo> => {
    // Module info API takes in subject and catalog number separately, so we need
    // to split the module code prefix out from the rest of it
    const parts = /^([a-z]+)(.+)$/i.exec(moduleCode);

    if (!parts || parts.length < 2) {
      throw new RangeError(`moduleCode ${moduleCode} does not look like a module code`);
    }

    // catalognbr = Catalog number
    const [subject, catalognbr] = parts;
    const modules = await this.callApi('module', {
      term,
      subject,
      catalognbr,
    });

    if (modules.length === 0) throw new NotFoundError();
    return modules[0];
  };

  /**
   * Get all modules corresponding to a specific faculty during a specific term
   */
  getFacultyModules = async (term: string, facultyCode: string) =>
    this.callModulesEndpoint(term, { acadgroup: facultyCode });

  /**
   * Get all modules corresponding to a specific department during a specific term
   */
  getDepartmentModules = async (term: string, departmentCode: string): Promise<ModuleInfo[]> =>
    this.callModulesEndpoint(term, { acadorg: departmentCode });

  /**
   * Returns every lesson associated with a module in a specific term in one massive
   * array
   */
  getModuleTimetable = async (term: string, module: ModuleCode): Promise<TimetableLesson[]> =>
    this.callApi('classtt/withdate', {
      term,
      module,
    });

  getDepartmentTimetables = async (
    term: string,
    departmentCode: string,
  ): Promise<TimetableLesson[]> =>
    this.callApi('classtt/withdate', {
      term,
      deptfac: departmentCode,
    });

  getSemesterTimetables = async (term: string): Promise<TimetableLesson[]> =>
    this.callApi('classtt/withdate', { term });

  /**
   * Get exam info for a specific module
   *
   * @throws {NotFoundError} If the module in question has no exam (or if the information
   *    is not available yet - the API makes no distinction)
   */
  getModuleExam = async (term: string, module: ModuleCode): Promise<ModuleExam> => {
    const exams = await this.callApi('examtt', {
      term,
      module,
    });

    if (exams.length === 0) throw new NotFoundError();
    return exams[0];
  };

  /**
   * Get exam info on all modules in a semester
   */
  getTermExams = async (term: string): Promise<ModuleExam[]> => this.callApi('examtt', { term });
}

// Export as default a singleton instance to be used globally
const singletonInstance = new API(config.apiConcurrency);
export default singletonInstance;
