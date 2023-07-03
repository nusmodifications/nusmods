import { createSelector } from 'reselect';

import type { ModuleCode, ModuleCondensed, Semester } from 'types/modules';
import type { ModuleCodeMap, ModuleSelectListItem } from 'types/reducers';
import type { SemTimetableConfig } from 'types/timetables';
import type { State } from 'types/state';

import { notNull } from 'types/utils';
import { isOngoing } from './requests';
import { getRequestModuleCode } from '../actions/constants';

// Returns a getter that returns module condensed given a module code
export type ModuleCondensedGetter = (moduleCode: ModuleCode) => ModuleCondensed | undefined;
export const getModuleCondensed = createSelector(
  ({ moduleBank }: State) => moduleBank.moduleCodes,
  (moduleCodes: ModuleCodeMap): ModuleCondensedGetter =>
    (moduleCode: ModuleCode) =>
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
