// @flow
import qs from 'query-string';
import type { Semester } from 'types/modules';
import type { State } from 'reducers';
import type { ExportData } from 'types/export';
import { getSemesterTimetable } from 'reducers/timetables';

export function extractStateForExport(semester: Semester, state: State): ExportData {
  const { colors, timetable } = getSemesterTimetable(semester, state.timetables);
  const hidden = state.timetables.hidden[semester] || [];

  return {
    semester,
    timetable,
    colors,
    hidden,
    theme: state.theme,
    settings: {
      mode: state.settings.mode,
    },
  };
}

export function serializeExportState(data: ExportData, options: Object = {}): string {
  return qs.stringify({
    data: JSON.stringify(data),
    ...options,
  });
}
