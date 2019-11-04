import { ModuleCode, Semester } from 'types/modules';
import config from 'config';
import { isOngoing, isSuccess } from 'selectors/requests';
import { State } from 'types/state';
import { fetchArchiveRequest } from 'actions/constants';
import { ColorMapping, TimetablesState } from 'types/reducers';
import { SemTimetableConfig } from 'types/timetables';

export function isArchiveLoading(state: State, moduleCode: ModuleCode) {
  return config.archiveYears.some((year) =>
    isOngoing(state, fetchArchiveRequest(moduleCode, year)),
  );
}

export function availableArchive(state: State, moduleCode: ModuleCode): string[] {
  return config.archiveYears.filter((year) =>
    isSuccess(state, fetchArchiveRequest(moduleCode, year)),
  );
}

// Extract sem timetable and colors for a specific semester from TimetablesState
const EMPTY_OBJECT = {};
export function getSemesterTimetable(
  semester: Semester,
  state: TimetablesState,
): { timetable: SemTimetableConfig; colors: ColorMapping } {
  return {
    timetable: state.lessons[semester] || EMPTY_OBJECT,
    colors: state.colors[semester] || EMPTY_OBJECT,
  };
}
