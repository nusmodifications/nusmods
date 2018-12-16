// @flow
import type { FSA } from 'types/redux';
import type { Module, ModuleCode } from 'types/modules';
import type { ModuleCodeMap, ModuleList } from 'types/reducers';
import { SUCCESS } from 'types/reducers';

import update from 'immutability-helper';
import { REHYDRATE } from 'redux-persist';
import { keyBy, omit, size, zipObject } from 'lodash';

import {
  FETCH_ARCHIVE_MODULE,
  FETCH_MODULE,
  FETCH_MODULE_LIST,
  REMOVE_LRU_MODULE,
  UPDATE_MODULE_TIMESTAMP,
} from 'actions/moduleBank';
import { SET_EXPORTED_DATA } from 'actions/export';

export type ModulesMap = {
  [ModuleCode]: Module,
};

export type ModuleArchive = {
  [ModuleCode]: {
    [string]: Module,
  },
};

export type ModuleBank = {
  moduleList: ModuleList,
  modules: ModulesMap,
  moduleCodes: ModuleCodeMap,
  moduleArchive: ModuleArchive,
  apiLastUpdatedTimestamp: ?string,
};

const defaultModuleBankState: ModuleBank = {
  moduleList: [], // List of basic modules data (module code, name, semester)
  modules: {}, // Object of Module code -> Module details
  moduleCodes: {},
  moduleArchive: {},
  apiLastUpdatedTimestamp: undefined,
};

function precomputeFromModuleList(moduleList: ModuleList) {
  // Cache a mapping of all module codes to module data for fast module data lookup
  const moduleCodes = zipObject(moduleList.map((module) => module.ModuleCode), moduleList);

  return { moduleCodes };
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

    case FETCH_MODULE + SUCCESS:
      return {
        ...state,
        modules: {
          ...state.modules,
          [action.payload.ModuleCode]: action.payload,
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

    case FETCH_ARCHIVE_MODULE + SUCCESS: {
      const { meta } = action;
      if (!meta) {
        return state;
      }

      return update(state, {
        moduleArchive: {
          [action.payload.ModuleCode]: {
            $auto: {
              [meta.academicYear]: {
                $auto: { $set: action.payload },
              },
            },
          },
        },
      });
    }

    case SET_EXPORTED_DATA:
      return {
        ...state,
        modules: keyBy(action.payload.modules, (module: Module) => module.ModuleCode),
      };

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

export default moduleBank;

export const persistConfig = {
  throttle: 1000,
  whitelist: ['modules', 'moduleList'],
};
