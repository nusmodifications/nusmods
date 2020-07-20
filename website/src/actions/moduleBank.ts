import { size } from 'lodash';

import type { AcadYear, Module, ModuleCode, ModuleCondensed } from 'types/modules';
import type { RequestActions } from 'middlewares/requests-middleware';
import type { Dispatch, GetState } from 'types/redux';

import { requestAction } from 'actions/requests';
import NUSModsApi from 'apis/nusmods';
import config from 'config';
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

export function fetchModuleList() {
  return requestAction(FETCH_MODULE_LIST, {
    url: NUSModsApi.moduleListUrl(),
  });
}
export type FetchModuleListActions = RequestActions<typeof FETCH_MODULE_LIST, ModuleCondensed[]>;

const MAX_MODULE_LIMIT = 100;
export const Internal = {
  updateModuleTimestamp(moduleCode: ModuleCode) {
    return {
      type: UPDATE_MODULE_TIMESTAMP,
      payload: moduleCode,
    };
  },

  removeLRUModule(moduleCodes: ModuleCode[]) {
    return {
      type: REMOVE_LRU_MODULE,
      payload: moduleCodes,
    };
  },
};

export function fetchModule(moduleCode: ModuleCode) {
  return (dispatch: Dispatch, getState: GetState) => {
    const onFinally = () => {
      // Update the timestamp of the accessed module if it is in the store.
      if (getState().moduleBank.modules[moduleCode]) {
        dispatch(Internal.updateModuleTimestamp(moduleCode));
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
          dispatch(Internal.removeLRUModule(LRUModule));
        }
      }
    };

    const key = fetchModuleRequest(moduleCode);

    return dispatch<Module>(
      requestAction(key, FETCH_MODULE, {
        url: NUSModsApi.moduleDetailsUrl(moduleCode),
      }),
    ).then(
      (module) => {
        onFinally();
        return module;
      },
      (error: Error) => {
        onFinally();
        throw error;
      },
    );
  };
}
export type FetchModuleActions = RequestActions<typeof FETCH_MODULE, Omit<Module, 'timestamp'>>;

export function fetchModuleArchive(moduleCode: ModuleCode, year: string) {
  const key = fetchArchiveRequest(moduleCode, year);
  const action = requestAction(key, FETCH_ARCHIVE_MODULE, {
    url: NUSModsApi.moduleDetailsUrl(moduleCode, year),
  });

  action.meta.academicYear = year;
  return action;
}
export type FetchModuleArchiveActions = RequestActions<
  typeof FETCH_ARCHIVE_MODULE,
  Omit<Module, 'timestamp'>,
  { academicYear: string }
>;

export function fetchAllModuleArchive(moduleCode: ModuleCode) {
  // Returns: Promise<[AcadYear, Module?][]>
  return (dispatch: Dispatch) =>
    Promise.all(
      config.archiveYears.map((year) =>
        dispatch<Module>(fetchModuleArchive(moduleCode, year))
          .catch(() => null)
          .then((module): [AcadYear, Module | null] => [year, module]),
      ),
    );
}

export type ModuleBankRequestActions =
  | FetchModuleListActions
  | FetchModuleActions
  | FetchModuleArchiveActions;
