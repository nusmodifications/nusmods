// @flow
import type { Semester } from 'types/modules';
import type { SemTimetableConfig } from 'types/timetables';

import React from 'react';
import { Sidebar } from 'views/components/icons';
import ShareTimetable from './ShareTimetable';
import ExportMenu from './ExportMenu';

import styles from './TimetableActions.scss';

type Props = {
  semester: Semester,
  timetable: SemTimetableConfig,
  isVerticalOrientation: boolean,
  toggleTimetableOrientation: Function,
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
        <ExportMenu semester={props.semester} />

        <ShareTimetable semester={props.semester} timetable={props.timetable} />
      </div>
    </div>
  );
}

export default TimetableActions;
