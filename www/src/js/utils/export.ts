import { Semester } from 'types/modulesBase';
import { ExportData } from 'types/export';
import { getSemesterTimetable } from 'reducers/timetables';
import { State } from 'types/state';

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
