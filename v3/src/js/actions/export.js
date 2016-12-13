// @flow
import domtoimage from 'dom-to-image';
import { iCalForTimetable } from 'utils/ical';

export const DOWNLOAD_AS_JPEG = 'DOWNLOAD_AS_JPEG';
export function downloadAsJpeg(domElement: Element) {
  return (dispatch: Function) => {
    dispatch({
      type: `${DOWNLOAD_AS_JPEG}_PENDING`,
    });

    const style = { margin: '0', marginLeft: '-0.25em' };
    return domtoimage.toJpeg(domElement, { bgcolor: '#fff', style })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'timetable.jpeg';
        link.href = dataUrl;
        link.click();
        dispatch({
          type: `${DOWNLOAD_AS_JPEG}_SUCCESS`,
        });
      })
      .catch((err) => {
        console.error(err);
        dispatch({
          type: `${DOWNLOAD_AS_JPEG}_FAILURE`,
        });
      });
  };
}

export const DOWNLOAD_AS_ICAL = 'DOWNLOAD_AS_ICAL';
export function downloadAsIcal(semester, timetable, moduleData) {
  const results = iCalForTimetable(semester, timetable, moduleData);
  return {
    type: DOWNLOAD_AS_ICAL,
    payload: results,
  };
}
