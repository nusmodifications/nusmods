import { ModuleCode, ModuleCondensed, Semester } from 'types/modules';
import { ModuleBank } from 'reducers/moduleBank';
import { State } from 'reducers';
import { SemTimetableConfig } from 'types/timetables';
import { ModuleSelectListItem } from 'types/reducers';
import { getRequestModuleCode } from 'actions/moduleBank';
import { isOngoing } from './requests';

export function getModuleCondensed(
  moduleBank: ModuleBank,
): (moduleCode: ModuleCode) => ModuleCondensed | null | undefined {
  return (moduleCode) => moduleBank.moduleCodes[moduleCode];
}

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
