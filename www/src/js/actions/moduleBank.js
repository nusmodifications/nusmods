// @flow
import type { ModuleCode } from 'types/modules';
import type { TimetableConfig } from 'types/timetables';
import type { FSA, GetState } from 'types/redux';

import { size, get, flatMap, sortBy } from 'lodash';
import { requestAction } from 'actions/requests';
import NUSModsApi from 'apis/nusmods';
import type { ModulesMap } from 'reducers/moduleBank';

const MAX_MODULE_LIMIT: number = 100;

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

export const UPDATE_MODULE_TIMESTAMP = 'UPDATE_MODULE_TIMESTAMP';
export function updateModuleTimestamp(moduleCode: ModuleCode) {
  return {
    type: UPDATE_MODULE_TIMESTAMP,
    payload: moduleCode,
  };
}

export const REMOVE_LRU_MODULE = 'REMOVE_LRU_MODULE';
export function removeLRUModule(moduleCode: ModuleCode[]) {
  return {
    type: REMOVE_LRU_MODULE,
    payload: moduleCode,
  };
}

// Export for testing
export function getLRUModules(
  modules: ModulesMap,
  lessons: TimetableConfig,
  currentModule: string,
  toRemove: number = 1,
): ModuleCode[] {
  // Pull all the modules in all the timetables
  const timetableModules = new Set(flatMap(lessons, (semester) => Object.keys(semester)));

  // Remove the module which is least recently used and which is not in timetable
  // and not the currently loaded one
  const canRemove = Object.keys(modules).filter(
    (moduleCode) => moduleCode !== currentModule && !timetableModules.has(moduleCode),
  );

  // Sort them based on the timestamp alone
  const sortedModules = sortBy(canRemove, (moduleCode) =>
    get(modules[moduleCode], ['timestamp'], 0),
  );

  return sortedModules.slice(0, toRemove);
}

export function fetchModule(moduleCode: ModuleCode) {
  return (dispatch: Function, getState: GetState) =>
    dispatch(
      requestAction(fetchModuleRequest(moduleCode), FETCH_MODULE, {
        url: NUSModsApi.moduleDetailsUrl(moduleCode),
      }),
    ).finally(() => {
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
    });
}
