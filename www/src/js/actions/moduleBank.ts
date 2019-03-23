import { requestAction } from 'actions/requests';
import NUSModsApi from 'apis/nusmods';
import config from 'config';
import { flatMap, get, size, sortBy, zip } from 'lodash';
import { ModulesMap } from 'reducers/constants';
import { Module } from 'types/modules';

import { GetState } from 'types/redux';
import { TimetableConfig } from 'types/timetables';
import { AcadYear, ModuleCode } from 'types/modulesBase';
import {
  FETCH_ARCHIVE_MODULE,
  FETCH_MODULE,
  FETCH_MODULE_LIST,
  REMOVE_LRU_MODULE,
  UPDATE_MODULE_TIMESTAMP,
} from './constants';

const MAX_MODULE_LIMIT = 100;

export function fetchModuleList() {
  return requestAction(FETCH_MODULE_LIST, FETCH_MODULE_LIST, {
    url: NUSModsApi.moduleListUrl(),
  });
}

export function fetchModuleRequest(moduleCode: ModuleCode) {
  return `${FETCH_MODULE}/${moduleCode}`;
}

export function getRequestModuleCode(key: string): ModuleCode | null {
  const parts = key.split('/');
  if (parts.length === 2 && parts[0] === FETCH_MODULE) return parts[1];
  return null;
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
  const canRemove: ModuleCode[] = Object.keys(modules).filter(
    (moduleCode) => moduleCode !== currentModule && !timetableModules.has(moduleCode),
  );

  // Sort them based on the timestamp alone
  const sortedModules = sortBy<ModuleCode>(canRemove, (moduleCode) =>
    get(modules[moduleCode], ['timestamp'], 0),
  );

  return sortedModules.slice(0, toRemove);
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

export function fetchArchiveRequest(moduleCode: ModuleCode, year: string) {
  return `${FETCH_ARCHIVE_MODULE}_${moduleCode}_${year}`;
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
