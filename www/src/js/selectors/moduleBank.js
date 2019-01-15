// @flow

import { createSelector } from 'reselect';
import type { ModuleCode, ModuleCondensed, Semester } from 'types/modules';
import type { ModuleBank } from 'reducers/moduleBank';
import type { State } from 'reducers';
import type { SemTimetableConfig } from 'types/timetables';
import type { ModuleSelectListItem } from 'types/reducers';
import { getRequestModuleCode } from 'actions/moduleBank';
import { isOngoing } from './requests';

const moduleCodesSelector = (state: ModuleBank) => state.moduleCodes;

// Returns a getter that returns module condensed given a module code
export type ModuleCondensedGetter = (moduleCode: ModuleCode) => ?ModuleCondensed;
export const getModuleCondensed = createSelector(
  moduleCodesSelector,
  (moduleCodes): ModuleCondensedGetter => (moduleCode) => moduleCodes[moduleCode],
);

export function getAllPendingModules(state: State): ModuleCode[] {
  return Object.keys(state.requests)
    .filter((key) => isOngoing(state, key))
    .map(getRequestModuleCode)
    .filter(Boolean);
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
      .filter((item) => item.Semesters.includes(semester))
      .map((module) => ({
        ...module,
        isAdded: module.ModuleCode in semTimetableConfig,
        isAdding: pendingModules.has(module.ModuleCode),
      }))
  );
}
