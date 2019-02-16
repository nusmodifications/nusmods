import { Semester } from 'types/modules';
import { State } from 'reducers';
import { ExportData } from 'types/export';
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
