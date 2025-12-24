/**
 * API wrapper that handles calls to the NUS module and class data servers.
 *
 * The default export is a singleton instance of the API class. This allows us
 * to enforce global concurrency limit on the number of requests made.
 */

import { URL } from 'url';
import axios from 'axios';
import oboe from 'oboe';
import Queue from 'promise-queue';

import type {
  AcademicGrp,
  AcademicOrg,
  ModuleExam,
  ModuleInfo,
  TimetableLesson,
} from '../types/api';
import type { ModuleCode } from '../types/modules';

import { AuthError, NotFoundError, UnknownApiError } from '../utils/errors';
import { fromTermCode } from '../utils/api';
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
type ApiHeaders = {
  [key: string]: string;
};

// Error codes specified by the API. Note that these, like many other things
// in the API, are not to be relied upon completely
type StatusCode = '00000' | '10000' | '10001';
const OKAY: StatusCode = '00000';
const AUTH_ERROR: StatusCode = '10000';
const RECORD_NOT_FOUND: StatusCode = '10001';

// V1 API response format
type V1ApiResponse<Data> = {
  msg: string;
  data: Data;
  code: StatusCode;
};

// Shared headers for all API requests
const commonHeaders: ApiHeaders = {
  'Content-Type': 'application/json',
};

// Authentication via tokens sent through headers
const ttHeaders: ApiHeaders = {
  'X-API-KEY': config.ttApiKey,
};
const courseHeaders: ApiHeaders = {
  'X-API-KEY': config.courseApiKey,
};
const acadHeaders: ApiHeaders = {
  'X-API-KEY': config.acadApiKey,
  'X-APP-KEY': config.acadAppKey,
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

/**
 * Maps the 4-digit term code to the parameters expected by the CourseNUSMods API.
 */
function mapTermToApiParams(term: string) {
  const [acadYear, semester] = fromTermCode(term);

  // 2024/2025 -> 2024/25
  const yearParts = acadYear.split('/');
  const shortYear = `${yearParts[0]}/${yearParts[1].slice(2)}`;

  let applicableInSem = '';
  switch (semester) {
    case 1:
      applicableInSem = 'Semester 1';
      break;
    case 2:
      applicableInSem = 'Semester 2';
      break;
    case 3:
      applicableInSem = 'Special Semester (Part 1)';
      break;
    case 4:
      applicableInSem = 'Special Semester (Part 2)';
      break;
    default:
      applicableInSem = `Semester ${semester}`;
  }

  return {
    applicableInYear: shortYear,
    applicableInSem,
  };
}

/* eslint-disable camelcase */

/**
 * Base API call function. This function wraps around axios to provide basic
 * configuration such as authentication which all API calls should have,
 * as well as error handling. Returns the raw response data.
 */
async function callApi<ResponseData>(
  endpoint: string,
  params: ApiParams,
  headers: ApiHeaders,
): Promise<{ data: ResponseData; response: any }> {
  // 1. Construct request URL
  const url = new URL(endpoint, config.baseUrl);

  // 2. Encode params in the query string for GET requests
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const startTime = Date.now();
  console.log(`[API] START: ${endpoint}`, params);

  let response;

  try {
    // 3. All API requests use GET HTTP method with params encoded in the query string.
    response = await axios.get(url.href, {
      // 4. Apply authentication using headers
      headers: {
        ...commonHeaders,
        ...headers,
      },
    });

    const duration = Date.now() - startTime;
    console.log(`[API] DONE: ${endpoint} (${duration}ms)`, params);
  } catch (e) {
    const duration = Date.now() - startTime;
    console.error(`[API] ERROR: ${endpoint} (${duration}ms)`, params, e.message);
    // 5. Handle network / request level errors, eg. server returning non-200
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

  return { data: response.data, response };
}

/**
 * Calls the API nested under v1 and performs application-level error checking.
 * Expects response format: { msg, data, code }
 */
async function callV1Api<Data>(
  endpoint: string,
  params: ApiParams,
  headers: ApiHeaders,
): Promise<Data> {
  const startTime = Date.now();
  const { data: responseData, response } = await callApi<V1ApiResponse<Data>>(
    endpoint,
    params,
    headers,
  );

  const { msg, data, code } = responseData;

  // Handle application level errors
  if (code !== OKAY) {
    const duration = Date.now() - startTime;
    console.error(`[API] APP_ERROR: ${endpoint} (${duration}ms)`, params, code, msg);
    const error = mapErrorCode(code, msg);

    error.response = response;
    error.requestConfig = response.config;
    throw error;
  }

  // No error - return the data
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
   * Returns raw response data without application-level error checking
   */
  callApi = async <T>(endpoint: string, params: ApiParams, headers: ApiHeaders) =>
    this.queue.add(() => callApi<T>(endpoint, params, headers));

  /**
   * Wrapper around base callV1Api method that pushes the call into a queue
   * Performs application-level error checking (expects { msg, data, code })
   */
  callV1Api = async <T>(endpoint: string, params: ApiParams, headers: ApiHeaders) =>
    this.queue.add(() => callV1Api<T>(endpoint, params, headers));

  /**
   * Calls the modules endpoint
   */
  callModulesEndpoint = async (term: string, params: ApiParams): Promise<ModuleInfo[]> => {
    const termParams = mapTermToApiParams(term);
    const maxItems = 1000;
    const baseParams = {
      ...termParams,
      ...params,
      latestVersionOnly: 'True',
      publishedOnly: 'True',
      maxItems: String(maxItems),
    };

    try {
      // 1. Fetch the first page to get the total itemCount
      const firstResponse = await this.callApi<{ data: ModuleInfo[]; itemCount: number }>(
        'CourseNUSMods',
        {
          ...baseParams,
          offset: '0',
        },
        courseHeaders,
      );

      const allModules = [...firstResponse.data.data];
      const { itemCount } = firstResponse.data;

      // 2. If there are more items, fetch the remaining pages in parallel.
      // Since this.callApi uses a queue, concurrency will still be limited.
      const remainingPages = [];
      for (let offset = allModules.length; offset < itemCount; offset += maxItems) {
        remainingPages.push(
          this.callApi<{ data: ModuleInfo[]; itemCount: number }>(
            'CourseNUSMods',
            {
              ...baseParams,
              offset: String(offset),
            },
            courseHeaders,
          ),
        );
      }

      if (remainingPages.length > 0) {
        const responses = await Promise.all(remainingPages);
        responses.forEach((response) => {
          allModules.push(...response.data.data);
        });
      }

      console.log(
        `[API] CourseNUSMods fetched ${allModules.length}/${itemCount} results`,
        baseParams,
      );

      return allModules;
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
    this.callV1Api(
      'edurec/config/v1/get-acadgroup',
      {
        eff_status: 'A',
      },
      acadHeaders,
    );

  getDepartment = async (): Promise<AcademicOrg[]> =>
    this.callV1Api(
      'edurec/config/v1/get-acadorg',
      {
        eff_status: 'A',
      },
      acadHeaders,
    );

  getModuleInfo = async (term: string, moduleCode: ModuleCode): Promise<ModuleInfo> => {
    // Module info API takes in subject and catalog number separately, so we need
    // to split the module code prefix out from the rest of it
    const parts = /^([a-z]+)(.+)$/i.exec(moduleCode);

    if (!parts || parts.length < 2) {
      throw new RangeError(`moduleCode ${moduleCode} does not look like a module code`);
    }

    // catalognbr = Catalog number
    const [, subject, catalognbr] = parts;
    const termParams = mapTermToApiParams(term);
    const { data: response } = await this.callApi<{ data: ModuleInfo[]; itemCount: number }>(
      'CourseNUSMods',
      {
        ...termParams,
        subjectArea: subject,
        catalogNbr: catalognbr,
        latestVersionOnly: 'True',
        publishedOnly: 'True',
      },
      courseHeaders,
    );
    const modules = response.data;

    console.log(`[API] CourseNUSMods returned ${response.itemCount} result(s) for ${moduleCode}`);
    if (modules.length === 0) throw new NotFoundError(`Module ${moduleCode} cannot be found`);
    return modules[0];
  };

  getFacultyModules = async (term: string, facultyCode: string) =>
    this.callModulesEndpoint(term, { acadGroupCode: facultyCode.slice(0, 3) });

  getDepartmentModules = async (term: string, departmentCode: string): Promise<ModuleInfo[]> => {
    const modules = await this.callModulesEndpoint(term, {
      acadGroupCode: departmentCode.slice(0, 3),
    });
    return modules.filter((module) => module.OrganisationCode === departmentCode);
  };

  getModuleTimetable = async (term: string, module: ModuleCode): Promise<TimetableLesson[]> =>
    this.callV1Api(
      'timetable/v1/published/class/withdate',
      {
        term,
        module,
      },
      ttHeaders,
    );

  getDepartmentTimetables = async (
    term: string,
    departmentCode: string,
  ): Promise<TimetableLesson[]> =>
    this.callV1Api(
      'timetable/v1/published/class/withdate',
      {
        term,
        deptfac: departmentCode,
      },
      ttHeaders,
    );

  getSemesterTimetables = async (
    term: string,
    lessonConsumer: (lesson: TimetableLesson) => void,
  ): Promise<void> =>
    new Promise((resolve, reject) => {
      const endpoint = 'timetable/v1/published/class/withdate';
      const url = new URL(endpoint, config.baseUrl);
      url.searchParams.append('term', term);

      const startTime = Date.now();
      console.log(`[API] START STREAM: ${endpoint}`, { term });

      oboe({
        url: url.href,
        headers: {
          ...commonHeaders,
          ...ttHeaders,
        },
        method: 'GET',
      })
        .node('data[*]', (lesson: TimetableLesson) => {
          // Consume and discard each lesson
          lessonConsumer(lesson);
          return oboe.drop;
        })
        .done((data) => {
          const duration = Date.now() - startTime;
          // Handle application level errors
          const { code, msg } = data;

          if (code === OKAY) {
            console.log(`[API] DONE STREAM: ${endpoint} (${duration}ms)`, { term });
            resolve();
          } else {
            console.error(`[API] ERROR STREAM: ${endpoint} (${duration}ms)`, { term }, code, msg);
            const error = mapErrorCode(code, msg);
            error.requestConfig = { url: url.href };
            reject(error);
          }
        })
        .fail((error) => {
          const duration = Date.now() - startTime;
          const errorMsg = error.thrown?.message || (error as any).message || String(error);
          console.error(`[API] ERROR STREAM: ${endpoint} (${duration}ms)`, { term }, errorMsg);
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
    const exams = await this.callV1Api<ModuleExam[]>(
      'timetable/v1/published/exam',
      {
        term,
        module,
      },
      ttHeaders,
    );

    if (exams.length === 0)
      throw new NotFoundError(`Exams for ${module} cannot be found, or the module has no exams`);
    return exams[0];
  };

  getTermExams = async (term: string): Promise<ModuleExam[]> =>
    this.callV1Api('timetable/v1/published/exam', { term }, ttHeaders);
}

// Export as default a singleton instance to be used globally
const singletonInstance: INusApi = new NusApi(config.apiConcurrency);
export default singletonInstance;

// Exported for testing
export { callApi, callV1Api, NusApi };
