// @flow
import domtoimage from 'dom-to-image';
import ical from 'ical-generator';
import Raven from 'raven-js';

import type { ModuleCode, Module, Semester } from 'types/modules';
import type { SemTimetableConfigWithLessons } from 'types/timetables';
import { iCalForTimetable } from 'utils/ical';

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

export const DOWNLOAD_AS_IMAGE = 'DOWNLOAD_AS_IMAGE';
export function downloadAsImage(domElement: Element) {
  return (dispatch: Function) => {
    dispatch({
      type: `${DOWNLOAD_AS_IMAGE}_PENDING`,
    });

    const style = { margin: '0', marginLeft: '-0.25em' };
    return domtoimage
      .toBlob(domElement, { bgcolor: '#fff', style })
      .then((blob) => {
        downloadUrl(blob, 'timetable.png');
        dispatch({
          type: `${DOWNLOAD_AS_IMAGE}_SUCCESS`,
        });
      })
      .catch((e) => {
        Raven.captureException(e);
        dispatch({
          type: `${DOWNLOAD_AS_IMAGE}_FAILURE`,
        });
      });
  };
}

export const DOWNLOAD_AS_ICAL = 'DOWNLOAD_AS_ICAL';
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

  return {
    type: DOWNLOAD_AS_ICAL,
    payload: cal.toString(),
  };
}
