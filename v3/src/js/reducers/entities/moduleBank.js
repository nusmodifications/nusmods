// @flow
import type { FSA } from 'redux';
import type {
  Module,
  ModuleCode,
} from 'types/modules';

import { FETCH_MODULE_LIST, FETCH_MODULE } from 'actions/moduleBank';
import * as RequestResultCases from 'middlewares/requests-middleware';

export type ModuleBank = {
  moduleList: Array<any>,
  moduleListSelect: Array<any>,
  modules: {
    [key: ModuleCode]: Module
  },
};

const defaultModuleBankState: ModuleBank = {
  moduleList: [],     // List of modules
  moduleListSelect: [],
  modules: {},       // Object of ModuleCode -> ModuleDetails
};

function moduleBank(state: ModuleBank = defaultModuleBankState, action: FSA): ModuleBank {
  switch (action.type) {
    case FETCH_MODULE_LIST + RequestResultCases.SUCCESS:
      return {
        ...state,
        moduleList: action.response,
        moduleListSelect: action.response.map((module: Module): { label: ModuleCode, value: string } => {
          return {
            value: module.ModuleCode,
            label: `${module.ModuleCode} ${module.ModuleTitle}`,
          };
        }),
      };
    case FETCH_MODULE + RequestResultCases.SUCCESS:
      return {
        ...state,
        modules: {
          ...state.modules,
          [action.response.ModuleCode]: action.response,
        },
      };
    default:
      return state;
  }
}

export default moduleBank;
