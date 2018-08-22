// @flow
import type { ModuleCode } from 'types/modules';
import type { FSA } from 'types/redux';

import { requestAction } from 'actions/requests';
import NUSModsApi from 'apis/nusmods';
import config from 'config';

export const FETCH_MODULE_LIST: string = 'FETCH_MODULE_LIST';
export function fetchModuleList(): FSA {
  return requestAction(FETCH_MODULE_LIST, FETCH_MODULE_LIST, {
    url: NUSModsApi.moduleListUrl(),
  });
}

// Action to fetch module
export const FETCH_MODULE: string = 'FETCH_MODULE';
export function fetchModuleRequest(moduleCode: ModuleCode) {
  return `${FETCH_MODULE}_${moduleCode}`;
}

export function fetchModule(moduleCode: ModuleCode): FSA {
  const key = fetchModuleRequest(moduleCode);
  return requestAction(key, FETCH_MODULE, {
    url: NUSModsApi.moduleDetailsUrl(moduleCode),
  });
}

// Action to fetch module from previous years
export const FETCH_ARCHIVE_MODULE: string = 'FETCH_ARCHIVE_MODULE';
export function fetchArchiveRequest(moduleCode: ModuleCode, year: string) {
  return `${FETCH_ARCHIVE_MODULE}_${moduleCode}_${year}`;
}

export function fetchModuleArchive(moduleCode: ModuleCode, year: string) {
  const key = fetchArchiveRequest(moduleCode, year);
  return requestAction(key, FETCH_ARCHIVE_MODULE, {
    url: NUSModsApi.moduleDetailsUrl(moduleCode, year),
  });
}

export function fetchAllModuleArchive(moduleCode: ModuleCode) {
  return (dispatch: Function) =>
    Promise.all(
      config.archiveYears.map((year) =>
        dispatch(fetchModuleArchive(moduleCode, year)).catch(() => null),
      ),
    ).then((modules) => modules.filter(Boolean));
}
