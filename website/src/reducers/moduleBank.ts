import produce, { Draft } from 'immer';
import { keyBy, omit, size, zipObject } from 'lodash';

import {
  FETCH_ARCHIVE_MODULE,
  FETCH_MODULE,
  FETCH_MODULE_LIST,
  REMOVE_LRU_MODULE,
  UPDATE_MODULE_TIMESTAMP,
  SET_EXPORTED_DATA,
} from 'actions/constants';
import { createMigrate, REHYDRATE } from 'redux-persist';
import { Module } from 'types/modules';
import { ModuleBank, ModuleList } from 'types/reducers';
import { SUCCESS_KEY } from 'middlewares/requests-middleware';

import { Actions } from 'types/actions';

const defaultModuleBankState: ModuleBank = {
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
        apiLastUpdatedTimestamp: action.meta && action.meta.responseHeaders['last-modified'],
      };

    case SUCCESS_KEY(FETCH_MODULE):
      return {
        ...state,
        modules: {
          ...state.modules,
          [action.payload.moduleCode]: { ...action.payload, timestamp: Date.now() },
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
  version: 1,
  throttle: 1000,
  whitelist: ['modules', 'moduleList'],
  migrate: createMigrate({
    // Clear out modules - after switching to API v2 we need to flush all of the
    // old module data
    1: (state) => ({
      ...state,
      modules: {},
      moduleList: [],
      // FIXME: Remove the next line when _persist is optional again.
      // Cause: https://github.com/rt2zz/redux-persist/pull/919
      // Issue: https://github.com/rt2zz/redux-persist/pull/1170
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      _persist: state?._persist!,
    }),
  }),
};
