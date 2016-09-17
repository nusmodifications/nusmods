// @flow
import type { FSA } from 'redux';
import type {
  Module,
  ModuleCode,
  ModuleCondensed,
  Semester,
} from 'types/modules';
import type {
  SemTimetableConfig,
} from 'types/timetable';

import _ from 'lodash';

import { FETCH_MODULE_LIST, FETCH_MODULE } from 'actions/moduleBank';
import * as RequestResultCases from 'middlewares/requests-middleware';

type ModuleSelectListItem = {
  label: string,
  value: ModuleCode,
  semesters: Array<number>
};
export type ModuleBank = {
  moduleList: Array<ModuleCondensed>,
  moduleSelectList: Array<ModuleSelectListItem>,
  modules: {
    [key: ModuleCode]: Module
  },
};

const defaultModuleBankState: ModuleBank = {
  moduleList: [],     // List of modules
  moduleSelectList: [],
  modules: {},       // Object of ModuleCode -> ModuleDetails
};

function moduleBank(state: ModuleBank = defaultModuleBankState, action: FSA): ModuleBank {
  switch (action.type) {
    case FETCH_MODULE_LIST + RequestResultCases.SUCCESS:
      return {
        ...state,
        moduleList: action.response,
        // Precompute this in reducer because putting this inside render is very expensive (5k modules!)
        moduleSelectList: action.response.map((module: ModuleCondensed): ModuleSelectListItem => {
          return {
            semesters: module.Semesters,
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
