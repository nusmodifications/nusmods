// @flow
import type { Semester } from 'types/modules';
import type { SemTimetableConfig } from 'types/timetables';
import classnames from 'classnames';

import React from 'react';
import { Sidebar, Type } from 'views/components/icons';
import ShareTimetable from './ShareTimetable';
import ExportMenu from './ExportMenu';

import styles from './TimetableActions.scss';

type Props = {
  semester: Semester,
  timetable: SemTimetableConfig,
  isVerticalOrientation: boolean,
  showTitle: boolean,
  toggleTimetableOrientation: Function,
  toggleTitleDisplay: Function,
};

function TimetableActions(props: Props) {
  const { isVerticalOrientation, showTitle } = props;
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

        <button
          type="button"
          className={classnames('btn', 'btn-svg', {
            'btn-outline-primary': !isVerticalOrientation,
            'btn-outline-secondary': isVerticalOrientation,
          })}
          onClick={props.toggleTitleDisplay}
          disabled={isVerticalOrientation}
        >
          <Type className={styles.typeIcon} />
          {showTitle ? 'Hide Titles' : 'Show Titles'}
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
