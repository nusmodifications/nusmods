// @flow
import domtoimage from 'dom-to-image';
import ical from 'ical-generator';

import type { ModuleCode, Module, Semester } from 'types/modules';
import type { SemTimetableConfigWithLessons } from 'types/timetables';
import { iCalForTimetable } from 'utils/ical';

function downloadUrl(url: string, filename: string) {
  const link = document.createElement('a');
  const body = document.body;
  if (!body) return;

  link.download = filename;
  link.href = url;

  body.appendChild(link);
  link.click();
  body.removeChild(link);
}

export const DOWNLOAD_AS_JPEG = 'DOWNLOAD_AS_JPEG';
export const TIMETABLE_EXPORT_HIDE_CLASS = 'timetable-export-hidden';
export function downloadAsJpeg(domElement: Element) {
  return (dispatch: Function) => {
    dispatch({
      type: `${DOWNLOAD_AS_JPEG}_PENDING`,
    });

    // Temporarily add a stylesheet to hide the elements that we don't want
    // to show in the exported image.
    const style = document.createElement('style');
    style.appendChild(document.createTextNode('')); // WebKit hack :(
    document.head.appendChild(style);
    style.sheet.insertRule(`.${TIMETABLE_EXPORT_HIDE_CLASS} { display: none; }`, 0);

    return domtoimage.toJpeg(domElement,
      {
        bgcolor: '#fff',
        style: {
          margin: '0',
          marginLeft: '-0.25em',
        },
      })
      .then((dataUrl) => {
        downloadUrl(dataUrl, 'timetable.jpeg');
        dispatch({
          type: `${DOWNLOAD_AS_JPEG}_SUCCESS`,
        });
      })
      .catch((err) => {
        console.error(err); // eslint-disable-line
        dispatch({
          type: `${DOWNLOAD_AS_JPEG}_FAILURE`,
        });
      })
      .then(() => {
        document.head.removeChild(style);
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
  const objectUrl = URL.createObjectURL(blob);
  downloadUrl(objectUrl, 'nusmods_calendar.ics');
  URL.revokeObjectURL(objectUrl);

  return {
    type: DOWNLOAD_AS_ICAL,
    payload: cal.toString(),
  };
}
