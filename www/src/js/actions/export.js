// @flow
import ical from 'ical-generator';

import type { ModuleCode, Module, Semester } from 'types/modules';
import type { SemTimetableConfigWithLessons } from 'types/timetables';
import type { ExportData } from 'types/export';
import { iCalForTimetable } from 'utils/ical';
import { hideLessonInTimetable, selectMode } from 'actions/settings';
import { setTimetable } from 'actions/timetables';
import { selectTheme, setTimetableOrientation } from 'actions/theme';

function downloadUrl(blob: Blob, filename: string) {
  const link = document.createElement('a');
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    const objectUrl = URL.createObjectURL(blob);
    link.download = filename;
    link.href = objectUrl;
    link.dispatchEvent(new MouseEvent('click'));
    URL.revokeObjectURL(objectUrl);
  }
}

export const SUPPORTS_DOWNLOAD = 'download' in document.createElement('a');

export function downloadAsIcal(
  semester: Semester,
  timetable: SemTimetableConfigWithLessons,
  moduleData: { [ModuleCode]: Module },
) {
  const events = iCalForTimetable(semester, timetable, moduleData);
  const cal = ical({
    domain: 'nusmods.com',
    prodId: '//NUSMods//NUSMods//EN',
    events,
  });

  const blob = new Blob([cal.toString()], { type: 'text/plain' });
  downloadUrl(blob, 'nusmods_calendar.ics');
}

export function setExportedData({
  semester,
  timetable,
  mode,
  hiddenInTimetable,
  theme,
}: ExportData) {
  return (dispatch: Function) => {
    // Timetable
    dispatch(setTimetable(semester, timetable, theme.colors));

    // Theme
    dispatch(selectTheme(theme.id));
    dispatch(setTimetableOrientation(theme.timetableOrientation));

    // Settings
    dispatch(selectMode(mode));
    hiddenInTimetable.forEach((moduleCode) => dispatch(hideLessonInTimetable(moduleCode)));
  };
}
