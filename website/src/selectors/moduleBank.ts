import { createSelector } from 'reselect';

import { ModuleCode, ModuleCondensed, Semester } from 'types/modules';
import { ModuleBank, ModuleCodeMap, ModuleSelectListItem } from 'types/reducers';
import { SemTimetableConfig } from 'types/timetables';
import { notNull } from 'types/utils';
import { State } from 'types/state';
import { isOngoing } from './requests';
import { getRequestModuleCode } from '../actions/constants';

const moduleCodesSelector = (state: ModuleBank) => state.moduleCodes;

// Returns a getter that returns module condensed given a module code
export type ModuleCondensedGetter = (moduleCode: ModuleCode) => ModuleCondensed | undefined;
export const getModuleCondensed = createSelector(
  moduleCodesSelector,
  (moduleCodes: ModuleCodeMap): ModuleCondensedGetter => (moduleCode: ModuleCode) =>
    moduleCodes[moduleCode],
);

export function getAllPendingModules(state: State): ModuleCode[] {
  return Object.keys(state.requests)
    .filter((key) => isOngoing(state, key))
    .map(getRequestModuleCode)
    .filter(notNull);
}

export function getSemModuleSelectList(
  state: State,
  semester: Semester,
  semTimetableConfig: SemTimetableConfig,
): ModuleSelectListItem[] {
  const pendingModules = new Set(getAllPendingModules(state));

  return (
    state.moduleBank.moduleList
      // In specified semester and not within the timetable.
      .filter((item) => item.semesters.includes(semester))
      .map((module) => ({
        ...module,
        isAdded: module.moduleCode in semTimetableConfig,
        isAdding: pendingModules.has(module.moduleCode),
      }))
  );
}
