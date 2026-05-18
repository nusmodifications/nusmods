import { produce, Draft } from 'immer';
import { keyBy, map, omit, size, zipObject } from 'lodash-es';

import type { Actions } from 'types/actions';
import type { Module } from 'types/modules';
import type { ModuleBank, ModuleList } from 'types/reducers';

import {
  FETCH_ARCHIVE_MODULE,
  FETCH_MODULE,
  FETCH_MODULE_LIST,
  REMOVE_LRU_MODULE,
  UPDATE_MODULE_TIMESTAMP,
  SET_EXPORTED_DATA,
} from 'actions/constants';
import { SUCCESS_KEY } from 'middlewares/requests-middleware';
import { REMEMBER_REHYDRATED } from 'redux-remember';

export const defaultModuleBankState: ModuleBank = {
  moduleList: [], // List of basic modules data (module code, name, semester)
  modules: {}, // Object of Module code -> Module details
  moduleCodes: {},
  moduleArchive: {},
  apiLastUpdatedTimestamp: null,
};

function precomputeFromModuleList(moduleList: ModuleList) {
  // Cache a mapping of all module codes to module data for fast module data lookup
  const moduleCodes = zipObject(
    moduleList.map((module) => module.moduleCode),
    moduleList,
  );

  return { moduleCodes };
}

function moduleBank(state: ModuleBank = defaultModuleBankState, action: Actions): ModuleBank {
  switch (action.type) {
    case SUCCESS_KEY(FETCH_MODULE_LIST):
      return {
        ...state,
        ...precomputeFromModuleList(action.payload),
        moduleList: action.payload,
        apiLastUpdatedTimestamp: action.meta?.responseHeaders['last-modified'] || null,
      };

    case SUCCESS_KEY(FETCH_MODULE):
      return {
        ...state,
        modules: {
          ...state.modules,
          [action.payload.moduleCode]: {
            ...action.payload,
            timestamp: Date.now(),
            semesterData: map(action.payload.semesterData, (semesterData) => ({
              ...semesterData,
              timetable: map(semesterData.timetable, (lesson, lessonIndex) => ({
                ...lesson,
                lessonIndex,
              })),
            })),
          },
        },
      };

    case UPDATE_MODULE_TIMESTAMP:
      return {
        ...state,
        modules: {
          ...state.modules,
          [action.payload]: {
            ...state.modules[action.payload],
            timestamp: Date.now(),
          },
        },
      };

    case REMOVE_LRU_MODULE: {
      const trimmedModules = omit(state.modules, action.payload);
      return {
        ...state,
        modules: trimmedModules,
      };
    }

    case SUCCESS_KEY(FETCH_ARCHIVE_MODULE): {
      const { meta } = action;
      if (!meta) {
        return state;
      }

      // Type hack to get this to work with the assignment below
      const module = { ...action.payload, timestamp: Date.now() } as Draft<Module>;
      return produce(state, (draft) => {
        if (!draft.moduleArchive[module.moduleCode]) {
          draft.moduleArchive[module.moduleCode] = {};
        }

        draft.moduleArchive[module.moduleCode][meta.academicYear] = module;
      });
    }

    case SET_EXPORTED_DATA:
      return {
        ...state,
        modules: keyBy(action.payload.modules, (module: Module) => module.moduleCode),
      };

    case REMEMBER_REHYDRATED:
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

export default moduleBank;
