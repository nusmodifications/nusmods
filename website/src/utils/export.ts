import { Semester } from 'types/modules';
import { ExportData } from 'types/export';
import { getSemesterTimetableColors } from 'selectors/timetables';
import { State } from 'types/state';
import { SemTimetableConfig } from 'types/timetables';

export function extractStateForExport(
  semester: Semester,
  timetable: SemTimetableConfig,
  state: State,
): ExportData {
  const colors = getSemesterTimetableColors(state)(semester);
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
