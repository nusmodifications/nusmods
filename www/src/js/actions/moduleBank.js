// @flow
import type { ModuleCode } from 'types/modules';
import type { FSA } from 'types/redux';

import { requestAction } from 'actions/requests';
import NUSModsApi from 'apis/nusmods';

export const FETCH_MODULE_LIST: string = 'FETCH_MODULE_LIST';
export function fetchModuleList(): FSA {
  return requestAction(FETCH_MODULE_LIST, FETCH_MODULE_LIST, {
    url: NUSModsApi.moduleListUrl(),
  });
}

export const FETCH_MODULE: string = 'FETCH_MODULE';
export function fetchModuleRequest(moduleCode: ModuleCode) {
  return `${FETCH_MODULE}_${moduleCode}`;
}

export function fetchModule(moduleCode: ModuleCode): FSA {
  return requestAction(fetchModuleRequest(moduleCode), FETCH_MODULE, {
    url: NUSModsApi.moduleDetailsUrl(moduleCode),
  });
}
