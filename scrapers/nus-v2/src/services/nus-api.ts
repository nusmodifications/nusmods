/**
 * API wrapper that handles calls to the NUS module and class data servers.
 *
 * The default export is a singleton instance of the API class. This allows us
 * to enforce global concurrency limit on the number of requests made.
 */

import axios from 'axios';
import oboe from 'oboe';
import Queue from 'promise-queue';
import { URL } from 'url';

import type {
  AcademicGrp,
  AcademicOrg,
  ModuleExam,
  ModuleInfo,
  TimetableLesson,
} from '../types/api';
import type { ModuleCode } from '../types/modules';

import { AuthError, NotFoundError, UnknownApiError } from '../utils/errors';
import config from '../config';

// Interface extracted for easier mocking
export interface INusApi {
  /**
   * Obtain an array of faculties in the school (aka. academic groups)
   */
  getFaculty: () => Promise<AcademicGrp[]>;

  /**
   * Obtain an array of departments in the school (aka. academic organizations)
   */
  getDepartment: () => Promise<AcademicOrg[]>;

  /**
   * Get info for a specific module in a specific term.
   *
   * @throws {NotFoundError} If module cannot be found.
   */
  getModuleInfo: (term: string, moduleCode: ModuleCode) => Promise<ModuleInfo>;

  /**
   * Get all modules corresponding to a specific faculty during a specific term
   */
  getFacultyModules: (term: string, facultyCode: string) => Promise<ModuleInfo[]>;

  /**
   * Get all modules corresponding to a specific department during a specific term
   */
  getDepartmentModules: (term: string, departmentCode: string) => Promise<ModuleInfo[]>;

  /**
   * Returns every lesson associated with a module in a specific term in one massive
   * array
   */
  getModuleTimetable: (term: string, module: ModuleCode) => Promise<TimetableLesson[]>;

  getDepartmentTimetables: (term: string, departmentCode: string) => Promise<TimetableLesson[]>;

  /**
   * Loads an entire semester's timetable from the API. Because the JSON returned
   * is very large, instead of waiting for the entire JSON to be loaded into memory
   * we pass the individual lessons to a consumer function instead as they are
   * streamed, then immediately discard them to limit memory usage.
   */
  getSemesterTimetables: (
    term: string,
    lessonConsumer: (lesson: TimetableLesson) => void,
  ) => Promise<void>;

  /**
   * Get exam info for a specific module
   *
   * @throws {NotFoundError} If the module in question has no exam (or if the information
   *    is not available yet - the API makes no distinction)
   */
  getModuleExam: (term: string, module: ModuleCode) => Promise<ModuleExam>;

  /**
   * Get exam info on all modules in a semester
   */
  getTermExams: (term: string) => Promise<ModuleExam[]>;
}

type ApiParams = {
  [key: string]: string;
};

// Error codes specified by the API. Note that these, like many other things
// in the API, are not to be relied upon completely
type STATUS_CODE = string;
const OKAY: STATUS_CODE = '00000';
const AUTH_ERROR: STATUS_CODE = '10000';
const RECORD_NOT_FOUND: STATUS_CODE = '10001';

// Authentication via tokens sent through headers
const headers = {
  'X-APP-API': config.appKey,
  'X-STUDENT-API': config.studentKey,
  'Content-Type': 'application/json',
};

/**
 * Map the error code from the API to the correct class
 */
function mapErrorCode(code: string, msg: string) {
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

  return error;
}

/* eslint-disable camelcase */

/**
 * Base API call function. This function wraps around axios to provide basic
 * configuration such as authentication which all API calls should have,
 * as well as error handling.
 */
async function callApi<Data>(endpoint: string, params: ApiParams): Promise<Data> {
  // 1. Construct request URL
  const url = new URL(endpoint, config.baseUrl);
  let response;

  try {
    // 2. All API requests use POST HTTP method with params encoded in JSON
    //    in the body
    response = await axios.post(url.href, params, {
      transformRequest: [(data) => JSON.stringify(data)],
      // 3. Apply authentication using header
      headers,
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
    const error = mapErrorCode(code, msg);

    error.response = response;
    error.requestConfig = response.config;
    throw error;
  }

  // 6. No error - return the data
  return data;
}

// Do not instantiate directly, use the singleton instance instead
class NusApi implements INusApi {
  readonly queue: Queue;

  constructor(concurrency: number) {
    this.queue = new Queue(concurrency, Infinity);
  }

  /**
   * Wrapper around base callApi method that pushes the call into a queue
   */
  callApi = async <T>(endpoint: string, params: ApiParams) =>
    this.queue.add(() => callApi<T>(endpoint, params));

  /**
   * Calls the modules endpoint
   */
  callModulesEndpoint = async (term: string, params: ApiParams): Promise<ModuleInfo[]> => {
    try {
      // DO NOT remove this await - the promise must settle so the catch
      // can handle the NotFoundError from the API
      return await this.callApi<ModuleInfo[]>('module', {
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

  getFaculty = async (): Promise<AcademicGrp[]> =>
    this.callApi('config/get-acadgroup', {
      eff_status: 'A',
      // % is a wildcard so this function returns everything
      acad_group: '%',
    });

  getDepartment = async (): Promise<AcademicOrg[]> =>
    this.callApi('config/get-acadorg', {
      eff_status: 'A',
      // % is a wildcard so this function returns everything
      acad_org: '%',
    });

  getModuleInfo = async (term: string, moduleCode: ModuleCode): Promise<ModuleInfo> => {
    // Module info API takes in subject and catalog number separately, so we need
    // to split the module code prefix out from the rest of it
    const parts = /^([a-z]+)(.+)$/i.exec(moduleCode);

    if (!parts || parts.length < 2) {
      throw new RangeError(`moduleCode ${moduleCode} does not look like a module code`);
    }

    // catalognbr = Catalog number
    const [subject, catalognbr] = parts;
    const modules = await this.callApi<ModuleInfo[]>('module', {
      term,
      subject,
      catalognbr,
    });

    if (modules.length === 0) throw new NotFoundError(`Module ${moduleCode} cannot be found`);
    return modules[0];
  };

  getFacultyModules = async (term: string, facultyCode: string) =>
    this.callModulesEndpoint(term, { acadgroup: facultyCode });

  getDepartmentModules = async (term: string, departmentCode: string): Promise<ModuleInfo[]> =>
    this.callModulesEndpoint(term, { acadorg: departmentCode });

  getModuleTimetable = async (term: string, module: ModuleCode): Promise<TimetableLesson[]> =>
    this.callApi('classtt/withdate/published', {
      term,
      module,
    });

  getDepartmentTimetables = async (
    term: string,
    departmentCode: string,
  ): Promise<TimetableLesson[]> =>
    this.callApi('classtt/withdate/published', {
      term,
      deptfac: departmentCode,
    });

  getSemesterTimetables = async (
    term: string,
    lessonConsumer: (lesson: TimetableLesson) => void,
  ): Promise<void> =>
    new Promise((resolve, reject) => {
      const endpoint = 'classtt/withdate/published';
      const url = new URL(endpoint, config.baseUrl);
      const body = JSON.stringify({ term });

      oboe({
        url: url.href,
        headers,
        body,
        method: 'POST',
      })
        .node('data[*]', (lesson: TimetableLesson) => {
          // Consume and discard each lesson
          lessonConsumer(lesson);
          return oboe.drop;
        })
        .done((data) => {
          // Handle application level errors
          const { code, msg } = data;

          if (code === OKAY) {
            resolve();
          } else {
            const error = mapErrorCode(code, msg);
            error.requestConfig = { url: url.href, data: body };
            reject(error);
          }
        })
        .fail((error) => {
          if (error.thrown) {
            reject(error.thrown);
          } else {
            const apiError = new UnknownApiError(`Unable to get semester timetable`);
            apiError.originalError = apiError;
            reject(apiError);
          }
        });
    });

  getModuleExam = async (term: string, module: ModuleCode): Promise<ModuleExam> => {
    const exams = await this.callApi<ModuleExam[]>('examtt/published', {
      term,
      module,
    });

    if (exams.length === 0)
      throw new NotFoundError(`Exams for ${module} cannot be found, or the module has no exams`);
    return exams[0];
  };

  getTermExams = async (term: string): Promise<ModuleExam[]> =>
    this.callApi('examtt/published', { term });
}

// Export as default a singleton instance to be used globally
const singletonInstance: INusApi = new NusApi(config.apiConcurrency);
export default singletonInstance;

// Exported for testing
export { callApi, NusApi };
