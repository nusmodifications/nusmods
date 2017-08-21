// @flow
import type { FSA } from 'types/redux';
import type {
  Module,
  ModuleCode,
  ModuleCondensed,
  Semester,
} from 'types/modules';
import type {
  SemTimetableConfig,
} from 'types/timetables';
import type { ModuleList, ModuleSelectList, ModuleSelectListItem } from 'types/reducers';

import _ from 'lodash';

import { FETCH_MODULE_LIST, FETCH_MODULE } from 'actions/moduleBank';
import * as RequestResultCases from 'middlewares/requests-middleware';

export type ModulesMap = {
  [ModuleCode]: Module,
};
export type ModuleBank = {
  moduleList: ModuleList,
  modules: ModulesMap,
  moduleSelectList: ModuleSelectList,
  moduleCodes: Set<ModuleCode>,
};

const defaultModuleBankState: ModuleBank = {
  moduleList: [], // List of modules
  modules: {}, // Object of ModuleCode -> ModuleDetails
  moduleSelectList: [],
  moduleCodes: new Set(),
};

function moduleBank(state: ModuleBank = defaultModuleBankState, action: FSA): ModuleBank {
  switch (action.type) {
    case FETCH_MODULE_LIST + RequestResultCases.SUCCESS: {
      // Cache a Set of all module codes for linking
      const moduleCodes = new Set();
      action.payload.forEach((module: ModuleCondensed) => moduleCodes.add(module.ModuleCode));

      // Precompute this in reducer because putting this inside render is very expensive (5k modules!)
      const moduleSelectList = action.payload.map((module: ModuleCondensed) => ({
        semesters: module.Semesters,
        value: module.ModuleCode,
        label: `${module.ModuleCode} ${module.ModuleTitle}`,
      }));

      return {
        ...state,
        moduleSelectList,
        moduleCodes,
        moduleList: action.payload,
      };
    }
    case FETCH_MODULE + RequestResultCases.SUCCESS:
      return {
        ...state,
        modules: {
          ...state.modules,
          [action.payload.ModuleCode]: action.payload,
        },
      };

    default:
      return state;
  }
}

export function getSemModuleSelectList(state: ModuleBank, semester: Semester,
  semTimetableConfig: SemTimetableConfig): Array<ModuleSelectListItem> {
  if (!state.moduleSelectList) {
    return [];
  }
  return state.moduleSelectList.filter((item: ModuleSelectListItem): boolean => {
    // In specified semester and not within the timetable.
    return _.includes(item.semesters, semester) && !semTimetableConfig[item.value];
  });
}

export default moduleBank;
