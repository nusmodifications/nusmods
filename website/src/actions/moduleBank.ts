import { requestAction } from 'actions/requests';
import NUSModsApi from 'apis/nusmods';
import config from 'config';
import { size, zip } from 'lodash';
import { AcadYear, Module, ModuleCode } from 'types/modules';

import { GetState } from 'types/redux';
import {
  FETCH_ARCHIVE_MODULE,
  FETCH_MODULE,
  FETCH_MODULE_LIST,
  fetchArchiveRequest,
  fetchModuleRequest,
  REMOVE_LRU_MODULE,
  UPDATE_MODULE_TIMESTAMP,
} from './constants';
import { getLRUModules } from './moduleBank-lru';

const MAX_MODULE_LIMIT = 100;

export function fetchModuleList() {
  return requestAction(FETCH_MODULE_LIST, FETCH_MODULE_LIST, {
    url: NUSModsApi.moduleListUrl(),
  });
}

export function updateModuleTimestamp(moduleCode: ModuleCode) {
  return {
    type: UPDATE_MODULE_TIMESTAMP,
    payload: moduleCode,
  };
}

export function removeLRUModule(moduleCodes: ModuleCode[]) {
  return {
    type: REMOVE_LRU_MODULE,
    payload: moduleCodes,
  };
}

export function fetchModule(moduleCode: ModuleCode) {
  return (dispatch: Function, getState: GetState) => {
    const onFinally = () => {
      // Update the timestamp of the accessed module if it is in the store.
      if (getState().moduleBank.modules[moduleCode]) {
        dispatch(updateModuleTimestamp(moduleCode));
      }

      // Remove the LRU module if the size exceeds the maximum and if anything
      // can be removed
      const overLimitCount = size(getState().moduleBank.modules) - MAX_MODULE_LIMIT;
      if (overLimitCount > 0) {
        const { moduleBank, timetables } = getState();

        const LRUModule = getLRUModules(
          moduleBank.modules,
          timetables.lessons,
          moduleCode,
          overLimitCount,
        );

        if (LRUModule) {
          dispatch(removeLRUModule(LRUModule));
        }
      }
    };

    const key = fetchModuleRequest(moduleCode);
    return dispatch(
      requestAction(key, FETCH_MODULE, {
        url: NUSModsApi.moduleDetailsUrl(moduleCode),
      }),
    ).then(
      (result: any) => {
        onFinally();
        return result;
      },
      (error: any) => {
        onFinally();
        throw error;
      },
    );
  };
}

export function fetchModuleArchive(moduleCode: ModuleCode, year: string) {
  const key = fetchArchiveRequest(moduleCode, year);
  const action = requestAction(key, FETCH_ARCHIVE_MODULE, {
    url: NUSModsApi.moduleDetailsUrl(moduleCode, year),
  });

  action.meta.academicYear = year;

  return action;
}

export function fetchAllModuleArchive(moduleCode: ModuleCode) {
  // Returns: Promise<[AcadYear, Module?][]>
  return (dispatch: Function) =>
    Promise.all(
      config.archiveYears.map((year) =>
        dispatch(fetchModuleArchive(moduleCode, year)).catch(() => null),
      ),
    ).then((modules) => zip<AcadYear, Module[]>(config.archiveYears, modules));
}
