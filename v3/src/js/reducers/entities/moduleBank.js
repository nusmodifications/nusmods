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
import type {
  ModuleList,
  ModuleSelectList,
  ModuleSelectListItem,
  ModuleCodeMap,
} from 'types/reducers';

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
  moduleCodes: ModuleCodeMap,
};

const defaultModuleBankState: ModuleBank = {
  moduleList: [], // List of modules
  modules: {}, // Object of ModuleCode -> ModuleDetails
  moduleSelectList: [],
  moduleCodes: {},
};

function precomputeFromModuleList(moduleList: ModuleList) {
  // Cache a mapping of all module codes to module data for fast module data lookup
  const moduleCodes = _.zipObject(
    moduleList.map(module => module.ModuleCode),
    moduleList,
  );

  // Precompute this in reducer because putting this inside render is very expensive (5k modules!)
  const moduleSelectList = moduleList.map((module: ModuleCondensed) => ({
    semesters: module.Semesters,
    value: module.ModuleCode,
    label: `${module.ModuleCode} ${module.ModuleTitle}`,
  }));

  return { moduleCodes, moduleSelectList };
}

function moduleBank(state: ModuleBank = defaultModuleBankState, action: FSA): ModuleBank {
  switch (action.type) {
    case FETCH_MODULE_LIST + RequestResultCases.SUCCESS:
      return {
        ...state,
        ...precomputeFromModuleList(action.payload),
        moduleList: action.payload,
      };

    case FETCH_MODULE + RequestResultCases.SUCCESS:
      return {
        ...state,
        modules: {
          ...state.modules,
          [action.payload.ModuleCode]: action.payload,
        },
      };

    default:
      // FIXME: HACK - Temporary solution to not having a specific dehydration action
      if (!state.moduleCodes && state.moduleList) {
        return {
          ...state,
          ...precomputeFromModuleList(state.moduleList),
        };
      }

      return state;
  }
}

export function getSemModuleSelectList(
  state: ModuleBank,
  semester: Semester,
  semTimetableConfig: SemTimetableConfig,
): ModuleSelectListItem[] {
  return state.moduleSelectList.filter((item: ModuleSelectListItem): boolean => {
    // In specified semester and not within the timetable.
    return _.includes(item.semesters, semester) && !semTimetableConfig[item.value];
  });
}

export default moduleBank;
