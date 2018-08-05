// @flow
import type { ModuleCode } from 'types/modules';
import type { FSA } from 'types/redux';

import { API_REQUEST } from 'middlewares/requests-middleware';
import NUSModsApi from 'apis/nusmods';

export const FETCH_MODULE_LIST: string = 'FETCH_MODULE_LIST';
export function fetchModuleList(): FSA {
  return {
    type: FETCH_MODULE_LIST,
    payload: {
      method: 'GET',
      url: NUSModsApi.moduleListUrl(),
    },
    meta: {
      [API_REQUEST]: FETCH_MODULE_LIST,
    },
  };
}

export const FETCH_MODULE: string = 'FETCH_MODULE';
export function fetchModuleRequest(moduleCode: ModuleCode) {
  return `${FETCH_MODULE}_${moduleCode}`;
}

export function fetchModule(moduleCode: ModuleCode): FSA {
  return {
    type: FETCH_MODULE,
    payload: {
      method: 'GET',
      url: NUSModsApi.moduleDetailsUrl(moduleCode),
    },
    meta: {
      [API_REQUEST]: fetchModuleRequest(moduleCode),
    },
  };
}
