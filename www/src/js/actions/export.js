// @flow
import ical from 'ical-generator';

import type { Module, Semester } from 'types/modules';
import type { State } from 'reducers';

import { iCalForTimetable } from 'utils/ical';
import { hydrateSemTimetableWithLessons } from 'utils/timetables';
import type { ExportData } from 'types/export';
import type { FSA } from 'types/redux';

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

export const SET_EXPORTED_DATA = 'SET_EXPORTED_DATA';
export function setExportedData(modules: Module[], data: ExportData): FSA {
  return {
    type: SET_EXPORTED_DATA,
    payload: {
      modules,
      ...data,
    },
  };
}
