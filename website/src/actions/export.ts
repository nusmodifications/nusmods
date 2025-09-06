import type { Module, ModuleCode, Semester } from 'types/modules';
import type { ExportData } from 'types/export';
import type { Dispatch, GetState } from 'types/redux';
import { hydrateSemTimetableWithLessons } from 'utils/timetables';
import { captureException } from 'utils/error';
import retryImport from 'utils/retryImport';
import { getSemesterTimetableLessons } from 'selectors/timetables';
import { PlannerStateSchema } from 'types/schemas/planner';
import { TaModulesConfig } from 'types/timetables';
import { SET_EXPORTED_DATA } from './constants';
import { openNotification } from './app';

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
        const taModules: TaModulesConfig = state.timetables.ta[semester] ?? [];

        const timetable = getSemesterTimetableLessons(state)(semester);
        const timetableWithLessons = hydrateSemTimetableWithLessons(timetable, modules, semester);

        const events = icalUtils.default(
          semester,
          timetableWithLessons,
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

export function downloadPlanner() {
  return (_dispatch: Dispatch, getState: GetState) => {
    const { planner } = getState();

    // removes _persist
    const parsed = PlannerStateSchema.safeParse(planner);
    if (!parsed.success) {
      _dispatch(openNotification('Planner data is corrupted.'));
      return;
    }

    const exportState = parsed.data;
    const bytes = new TextEncoder().encode(JSON.stringify(exportState));
    const blob = new Blob([bytes], { type: 'application/json' });
    downloadUrl(blob, 'nusmods_planner.json');
  };
}
