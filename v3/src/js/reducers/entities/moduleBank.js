// @flow
import type { FSA } from 'types/redux';
import type { Module, ModuleCode, Semester } from 'types/modules';
import type { SemTimetableConfig } from 'types/timetables';
import type { ModuleList, ModuleSelectListItem, ModuleCodeMap } from 'types/reducers';

import _ from 'lodash';

import { FETCH_MODULE_LIST, FETCH_MODULE } from 'actions/moduleBank';
import * as RequestResultCases from 'middlewares/requests-middleware';

export type ModulesMap = {
  [ModuleCode]: Module,
};
export type ModuleBank = {
  moduleList: ModuleList,
  modules: ModulesMap,
  moduleCodes: ModuleCodeMap,
};

const defaultModuleBankState: ModuleBank = {
  moduleList: [], // List of modules
  modules: {}, // Object of ModuleCode -> ModuleDetails
  moduleCodes: {},
};

function precomputeFromModuleList(moduleList: ModuleList) {
  // Cache a mapping of all module codes to module data for fast module data lookup
  const moduleCodes = _.zipObject(moduleList.map(module => module.ModuleCode), moduleList);

  return { moduleCodes };
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
  return state.moduleList
    // In specified semester and not within the timetable.
    .filter(item => item.Semesters.includes(semester))
    .map(mod => ({
      ...mod,
      isAdded: mod.ModuleCode in semTimetableConfig,
    }));
}

export default moduleBank;
