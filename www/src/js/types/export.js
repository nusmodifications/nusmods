// @flow
import type { SemTimetableConfig } from 'types/timetables';
import type { ModuleCode, Semester } from 'types/modules';
import type { Mode } from 'types/settings';
import type { ThemeState } from 'types/reducers';

export type ExportData = {
  semester: Semester,
  timetable: SemTimetableConfig,
  theme: ThemeState,
  hiddenInTimetable: ModuleCode[],
  mode: Mode,
};
