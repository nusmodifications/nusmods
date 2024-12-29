import { Semester } from 'types/modules';
import { ExportData } from 'types/export';
import { getSemesterTimetableColors } from 'selectors/timetables';
import { State } from 'types/state';
import { SemTimetableConfig } from 'types/timetables';
import { ColorScheme } from 'types/settings';

export function extractStateForExport(
  semester: Semester,
  timetable: SemTimetableConfig,
  colorScheme: ColorScheme,
  state: State,
): ExportData {
  const colors = getSemesterTimetableColors(state)(semester);
  const hidden = state.timetables.hidden[semester] || [];
  const ta = state.timetables.ta[semester] || {};

  return {
    semester,
    timetable,
    colors,
    hidden,
    ta,
    theme: state.theme,
    settings: {
      colorScheme,
    },
  };
}
