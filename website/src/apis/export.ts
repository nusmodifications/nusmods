import qs from 'query-string';

import { Semester } from 'types/modules';
import { extractStateForExport } from 'utils/export';
import { State } from 'types/state';
import { SemTimetableConfig } from 'types/timetables';
import { ColorScheme } from 'types/settings';

export type ExportOptions = {
  pixelRatio?: number;
};

const baseUrl = 'https://export.nusmods.com/api/export';

function serializeState(
  semester: Semester,
  timetable: SemTimetableConfig,
  colorScheme: ColorScheme,
  state: State,
  options: ExportOptions = {},
) {
  return qs.stringify({
    data: JSON.stringify(extractStateForExport(semester, timetable, colorScheme, state)),
    ...options,
  });
}

export default {
  image: (
    semester: Semester,
    timetable: SemTimetableConfig,
    colorScheme: ColorScheme,
    state: State,
    pixelRatio = 1,
  ) =>
    `${baseUrl}/image?${serializeState(semester, timetable, colorScheme, state, { pixelRatio })}`,
  pdf: (
    semester: Semester,
    timetable: SemTimetableConfig,
    colorScheme: ColorScheme,
    state: State,
  ) => `${baseUrl}/pdf?${serializeState(semester, timetable, colorScheme, state)}`,
};
