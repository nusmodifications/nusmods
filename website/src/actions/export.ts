import type { Module, ModuleCode, Semester } from 'types/modules';
import type { ExportData } from 'types/export';
import type { Dispatch, GetState } from 'types/redux';
import {
  hydrateSemTimetableWithLessons,
  hydrateTaModulesConfigWithLessons,
} from 'utils/timetables';
import { captureException } from 'utils/error';
import retryImport from 'utils/retryImport';
import { getSemesterTimetableLessons } from 'selectors/timetables';
import { TaModulesConfig } from 'types/timetables';
import { SET_EXPORTED_DATA } from './constants';

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
  return (_dispatch: Dispatch, getState: GetState) => {
    Promise.all([
      retryImport(() => import(/* webpackChunkName: "export" */ 'ical-generator')),
      retryImport(() => import(/* webpackChunkName: "export" */ 'utils/ical')),
    ])
      .then(([ical, icalUtils]) => {
        const state = getState();
        const { modules } = state.moduleBank;
        const hiddenModules: ModuleCode[] = state.timetables.hidden[semester] ?? [];
        const taModules: TaModulesConfig = state.timetables.ta[semester] ?? {};

        const timetable = getSemesterTimetableLessons(state)(semester);
        const timetableWithLessons = hydrateSemTimetableWithLessons(timetable, modules, semester);
        const timetableWithTaLessons = hydrateTaModulesConfigWithLessons(
          taModules,
          modules,
          semester,
        );
        const filteredTimetableWithLessons = {
          ...timetableWithLessons,
          ...timetableWithTaLessons,
        };

        const events = icalUtils.default(
          semester,
          filteredTimetableWithLessons,
          modules,
          hiddenModules,
          taModules,
        );
        const cal = ical.default({
          domain: 'nusmods.com',
          prodId: '//NUSMods//NUSMods//EN',
          events,
        });

        const blob = new Blob([cal.toString()], { type: 'text/calendar' });
        downloadUrl(blob, 'nusmods_calendar.ics');
      })
      .catch(captureException);
  };
}

export function setExportedData(modules: Module[], data: ExportData) {
  return {
    type: SET_EXPORTED_DATA,
    payload: {
      modules,
      ...data,
    },
  };
}
