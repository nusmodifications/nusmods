// @flow
import type {
  ModuleCode,
} from 'types/modules';
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
      [API_REQUEST]: true,
    },
  };
}

export const FETCH_MODULE: string = 'FETCH_MODULE';
export function fetchModule(moduleCode: ModuleCode): FSA {
  return {
    type: FETCH_MODULE,
    payload: {
      method: 'GET',
      url: NUSModsApi.moduleDetailsUrl(moduleCode),
    },
    meta: {
      [API_REQUEST]: true,
    },
  };
}

export const LOAD_MODULE: string = 'LOAD_MODULE';
export function loadModule(moduleCode: ModuleCode) {
  return (dispatch: Function, getState: Function) => {
    // Module has been fetched before and cached. Don't have to fetch again.
    if (getState().entities.moduleBank.modules[moduleCode]) {
      return Promise.resolve();
    }
    return dispatch(fetchModule(moduleCode));
  };
}

export const FETCH_ALL_MODULES = 'FETCH_ALL_MODULES';
export function fetchAllModules(): FSA {
  return {
    type: FETCH_ALL_MODULES,
    payload: {
      method: 'GET',
      url: NUSModsApi.modulesUrl(),
    },
    meta: {
      [API_REQUEST]: true,
    },
  };
}
