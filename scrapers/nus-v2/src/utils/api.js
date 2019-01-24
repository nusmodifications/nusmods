// @flow

import axios from 'axios';

import config from '../config';
import type { AcademicGroup, AcademicOrg, ModuleInfo } from '../types/api';
import type { ModuleCode } from '../types/modules';
import { AuthError, NotFoundError, UnknownApiError } from './errors';

export type ApiParams = { [key: string]: any };

// Error codes
type STATUS_CODE = string;
const OKAY: STATUS_CODE = '00000';
const AUTH_ERROR: STATUS_CODE = '10000';
const RECORD_NOT_FOUND: STATUS_CODE = '10001';

// Base API call function
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

export async function getFaculty(): Promise<AcademicGroup[]> {
  return callApi('config/get-acadgroup', {
    eff_status: 'A',
    // % is a wildcard so this function returns everything
    acad_group: '%',
  });
}

export async function getDepartment(): Promise<AcademicOrg[]> {
  return callApi('config/acadorg', {
    eff_status: 'A',
    // % is a wildcard so this function returns everything
    acad_group: '%',
  });
}

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

export async function getDepartmentModules(
  term: string,
  departmentCode: string,
): Promise<ModuleInfo[]> {
  return callApi('module', {
    term,
    acadorg: departmentCode,
  });
}

export async function getFacultyModules(term: string, facultyCode: string) {
  return callApi('module', {
    term,
    acadgroup: facultyCode,
  });
}
