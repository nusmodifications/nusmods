import { Semester } from 'types/modules';
import { ExportData } from 'types/export';
import { getSemesterTimetable } from 'selectors/timetables';
import { State } from 'types/state';
import { SemTimetableConfig } from 'types/timetables';

export function extractStateForExport(
  semester: Semester,
  timetable: SemTimetableConfig,
  state: State,
): ExportData {
  const { colors } = getSemesterTimetable(semester, state.timetables);
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
