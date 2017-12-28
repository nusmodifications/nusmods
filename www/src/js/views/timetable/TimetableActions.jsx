// @flow
import type { Semester } from 'types/modules';
import type { SemTimetableConfig } from 'types/timetables';

import React from 'react';
import { Sidebar, Image, Calendar } from 'views/components/icons/index';
import { SUPPORTS_DOWNLOAD } from 'actions/export';
import ShareTimetable from './ShareTimetable';

import styles from './TimetableActions.scss';

type Props = {
  semester: Semester,
  timetable: SemTimetableConfig,
  isVerticalOrientation: boolean,
  toggleTimetableOrientation: Function,
  downloadAsImage: Function,
  downloadAsIcal: Function,
};

function TimetableActions(props: Props) {
  const { isVerticalOrientation } = props;
  return (
    <div
      className="btn-toolbar justify-content-between"
      role="toolbar"
      aria-label="Timetable utilities"
    >
      <div className={styles.leftButtonGroup} role="group" aria-label="Timetable manipulation">
        <button
          type="button"
          className="btn btn-outline-primary btn-svg"
          onClick={props.toggleTimetableOrientation}
        >
          <Sidebar className={styles.sidebarIcon} />
          {isVerticalOrientation ? 'Horizontal Mode' : 'Vertical Mode'}
        </button>
      </div>
      <div className={styles.rightButtonGroup} role="group" aria-label="Timetable exporting">
        {SUPPORTS_DOWNLOAD && (
          <button
            type="button"
            className="btn btn-outline-primary btn-svg"
            onClick={props.downloadAsImage}
          >
            <Image className="svg svg-small" />
            Export image
          </button>
        )}
        {SUPPORTS_DOWNLOAD && (
          <button
            type="button"
            className="btn btn-outline-primary btn-svg"
            onClick={props.downloadAsIcal}
          >
            <Calendar className="svg svg-small" />
            Export iCal
          </button>
        )}
        <ShareTimetable semester={props.semester} timetable={props.timetable} />
      </div>
    </div>
  );
}

export default TimetableActions;
