// @flow
import ical from 'ical-generator';

import type { Module, Semester } from 'types/modules';
import type { ExportData } from 'types/export';
import type { State } from 'reducers';
import type { FSA } from 'types/redux';
import { iCalForTimetable } from 'utils/ical';
import { hideLessonInTimetable, selectMode } from 'actions/settings';
import { setTimetable } from 'actions/timetables';
import { selectTheme, setTimetableOrientation } from 'actions/theme';
import { hydrateSemTimetableWithLessons } from 'utils/timetables';

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

export function downloadAsIcal(semester: Semester) {
  return (dispatch: Function, getState: () => State) => {
    const modules = getState().moduleBank.modules;
    const timetable = getState().timetables[semester] || {};
    const timetableWithLessons = hydrateSemTimetableWithLessons(timetable, modules, semester);

    const events = iCalForTimetable(semester, timetableWithLessons, modules);
    const cal = ical({
      domain: 'nusmods.com',
      prodId: '//NUSMods//NUSMods//EN',
      events,
    });

    const blob = new Blob([cal.toString()], { type: 'text/plain' });
    downloadUrl(blob, 'nusmods_calendar.ics');
  };
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

export const SET_MODULES = 'SET_MODULES';
export function setModules(modules: Module[]): FSA {
  return {
    type: SET_MODULES,
    payload: { modules },
  };
}
