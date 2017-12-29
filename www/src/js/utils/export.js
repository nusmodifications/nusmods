// @flow
import qs from 'query-string';
import type { Semester } from 'types/modules';
import type { State } from 'reducers';
import type { ExportData } from 'types/export';

export function extractStateForExport(semester: Semester, state: State): ExportData {
  return {
    semester,
    timetable: state.timetables[semester] || {},
    theme: state.theme,
    hiddenInTimetable: state.settings.hiddenInTimetable,
    mode: state.settings.mode,
  };
}

export function serializeExportState(data: ExportData, options: Object = {}): string {
  return qs.stringify({
    data: JSON.stringify(data),
    ...options,
  });
}

export function deserializeExportState(serialized: string): ExportData {
  return JSON.parse(qs.parse(serialized).data);
}
