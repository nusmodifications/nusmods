// @flow

import { API_REQUEST } from 'middlewares/requests-middleware';
import NUSModsApi from 'apis/nusmods';

import type {
  ModuleCode,
} from 'types/modules';

export const FETCH_MODULE_LIST: string = 'FETCH_MODULE_LIST';
export function fetchModuleList() {
  return (dispatch: Function) => dispatch({
    [API_REQUEST]: {
      type: FETCH_MODULE_LIST,
      payload: {
        method: 'GET',
        url: NUSModsApi.moduleListUrl(),
      },
    },
  });
}

export const FETCH_MODULE: string = 'FETCH_MODULE';
export function fetchModule(moduleCode: ModuleCode) {
  return (dispatch: Function) => dispatch({
    [API_REQUEST]: {
      type: FETCH_MODULE,
      payload: {
        method: 'GET',
        url: NUSModsApi.moduleDetailsUrl(moduleCode),
      },
    },
  });
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
