// @flow
import type { FSA } from 'types/redux';
import type { Module, ModuleCode, Semester } from 'types/modules';
import type { SemTimetableConfig } from 'types/timetables';
import type { ModuleCodeMap, ModuleList, ModuleSelectListItem } from 'types/reducers';
import { SUCCESS, FAILURE } from 'types/reducers';

import { REHYDRATE } from 'redux-persist';
import { keyBy, size, zipObject, get, omit } from 'lodash';

import LocalStorage from 'storage/localStorage';

import { FETCH_MODULE, FETCH_MODULE_LIST } from 'actions/moduleBank';
import { SET_EXPORTED_DATA } from 'actions/export';
import { API_REQUEST } from 'actions/requests';

export type ModulesMap = {
  [ModuleCode]: Module,
};
export type ModuleBank = {
  moduleList: ModuleList,
  modules: ModulesMap,
  moduleCodes: ModuleCodeMap,
  apiLastUpdatedTimestamp: ?string,
};

const defaultModuleBankState: ModuleBank = {
  moduleList: [], // List of modules
  modules: {}, // Object of ModuleCode -> ModuleDetails
  moduleCodes: {},
  apiLastUpdatedTimestamp: undefined,
};

const MAX_MODULE_LIMIT: number = 100;

function precomputeFromModuleList(moduleList: ModuleList) {
  // Cache a mapping of all module codes to module data for fast module data lookup
  const moduleCodes = zipObject(moduleList.map((module) => module.ModuleCode), moduleList);

  return { moduleCodes };
}

function getLRUModule(modules) {
  // Need to access localStorage here since this comp does not have access to the timetable lessons.
  const timeTables = JSON.parse(JSON.parse(LocalStorage().getItem('persist:timetables')).lessons);
  // Pull all the modules in all the timetables
  const timeTableModules = Object.keys(timeTables).reduce(
    (moduleList, semester) => [...moduleList, ...Object.keys(timeTables[semester])],
    [],
  );
  const sortedModules = Object.keys(modules).sort((currElem, nextElem) => {
    const currElemTimestamp = get(modules[currElem], ['timestamp'], 0);
    const nextElemTimestamp = get(modules[nextElem], ['timestamp'], 0);
    if (currElemTimestamp < nextElemTimestamp) return -1;
    if (currElemTimestamp > nextElemTimestamp) return 1;
    return 0;
  });
  const moduleToBeDeleted = sortedModules.find((module) => !timeTableModules.includes(module));
  return moduleToBeDeleted || '';
}

function removeLRUModule(modules, loadedModuleCode) {
  // No need to remove from state when no new module is loaded
  if (modules[loadedModuleCode]) {
    return modules;
  }
  return omit(modules, getLRUModule(modules));
}

function moduleBank(state: ModuleBank = defaultModuleBankState, action: FSA): ModuleBank {
  switch (action.type) {
    case FETCH_MODULE_LIST + SUCCESS:
      return {
        ...state,
        ...precomputeFromModuleList(action.payload),
        moduleList: action.payload,
        apiLastUpdatedTimestamp: action.meta && action.meta.responseHeaders['last-modified'],
      };

    case FETCH_MODULE + SUCCESS: {
      let modules = state.modules;
      if (size(modules) > MAX_MODULE_LIMIT) {
        modules = removeLRUModule(state.modules, action.payload.ModuleCode);
      }
      return {
        ...state,
        modules: {
          ...modules,
          [action.payload.ModuleCode]: {
            ...action.payload,
            timestamp: new Date().getTime(),
          },
        },
      };
    }

    case SET_EXPORTED_DATA:
      return {
        ...state,
        modules: keyBy(action.payload.modules, (module: Module) => module.ModuleCode),
      };

    case FETCH_MODULE + FAILURE: {
      const moduleCode = get(action, ['meta', API_REQUEST], '').split('_')[2];
      // Update the timestamp to keep track of when the module was last accessed even when the call fails if it is in state/cache
      if (state.modules[moduleCode]) {
        return {
          ...state,
          modules: {
            ...state.modules,
            [moduleCode]: {
              ...state.modules[moduleCode],
              timestamp: new Date().getTime(),
            },
          },
        };
      }
      return state;
    }

    case REHYDRATE:
      if (!size(state.moduleCodes) && state.moduleList) {
        return {
          ...state,
          ...precomputeFromModuleList(state.moduleList),
        };
      }

      return state;

    default:
      return state;
  }
}

export function getSemModuleSelectList(
  state: ModuleBank,
  semester: Semester,
  semTimetableConfig: SemTimetableConfig,
): ModuleSelectListItem[] {
  return (
    state.moduleList
      // In specified semester and not within the timetable.
      .filter((item) => item.Semesters.includes(semester))
      .map((mod) => ({
        ...mod,
        isAdded: mod.ModuleCode in semTimetableConfig,
      }))
  );
}

export default moduleBank;

export const persistConfig = {
  throttle: 1000,
  whitelist: ['modules', 'moduleList'],
};
