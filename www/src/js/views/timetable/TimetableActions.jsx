// @flow
import React, { Fragment } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { toggleTimetableOrientation, toggleTitleDisplay } from 'actions/theme';
import type { Semester } from 'types/modules';
import type { SemTimetableConfig } from 'types/timetables';

import { SidebarIcon, TypeIcon, GridIcon, CalendarIcon } from 'views/components/icons';
import elements from 'views/elements';
import ShareTimetable from './ShareTimetable';
import ExportMenu from './ExportMenu';

import styles from './TimetableActions.scss';

type Props = {
  semester: Semester,
  timetable: SemTimetableConfig,

  isVerticalOrientation: boolean,
  toggleTimetableOrientation: Function,

  showTitle: boolean,
  toggleTitleDisplay: Function,

  showExamCalendar: boolean,
  toggleExamCalendar: Function,
};

function TimetableActions(props: Props) {
  const { isVerticalOrientation, showTitle } = props;

  return (
    <div
      className="btn-toolbar justify-content-between"
      role="toolbar"
      aria-label="Timetable utilities"
    >
      <div className={styles.buttonGroup} role="group" aria-label="Timetable manipulation">
        <button
          type="button"
          className={classnames('btn btn-outline-primary btn-svg')}
          onClick={props.toggleTimetableOrientation}
          disabled={props.showExamCalendar}
        >
          <SidebarIcon className={styles.sidebarIcon} />
          {isVerticalOrientation ? 'Horizontal Mode' : 'Vertical Mode'}
        </button>

        {!isVerticalOrientation && (
          <button
            type="button"
            className={classnames(styles.titleBtn, 'btn-outline-primary btn btn-svg')}
            onClick={props.toggleTitleDisplay}
            disabled={props.showExamCalendar}
          >
            <TypeIcon className={styles.titleIcon} />
            {showTitle ? 'Hide Titles' : 'Show Titles'}
          </button>
        )}

        <button
          type="button"
          className={classnames(
            styles.calendarBtn,
            elements.examCalendarBtn,
            'btn-outline-primary btn btn-svg',
          )}
          onClick={props.toggleExamCalendar}
        >
          {props.showExamCalendar ? (
            <Fragment>
              <GridIcon className="svg svg-small" /> Timetable
            </Fragment>
          ) : (
            <Fragment>
              <CalendarIcon className="svg svg-small" /> Exam Calendar
            </Fragment>
          )}
        </button>
      </div>

      <div className={styles.buttonGroup} role="group" aria-label="Timetable exporting">
        <ExportMenu semester={props.semester} />

        <ShareTimetable semester={props.semester} timetable={props.timetable} />
      </div>
    </div>
  );
}

export default connect(
  null,
  {
    toggleTimetableOrientation,
    toggleTitleDisplay,
  },
)(TimetableActions);
