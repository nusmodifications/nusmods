import * as React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { toggleTimetableOrientation, toggleTitleDisplay } from 'actions/theme';
import { Semester } from 'types/modules';
import { SemTimetableConfig } from 'types/timetables';

import { Calendar, Grid, Sidebar, Type } from 'views/components/icons';
import elements from 'views/elements';
import ShareTimetable from './ShareTimetable';
import ExportMenu from './ExportMenu';

import styles from './TimetableActions.scss';

type Props = {
  semester: Semester;
  timetable: SemTimetableConfig;

  isVerticalOrientation: boolean;
  toggleTimetableOrientation: () => void;

  showTitle: boolean;
  toggleTitleDisplay: () => void;

  showExamCalendar: boolean;
  toggleExamCalendar: () => void;
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
          <Sidebar className={styles.sidebarIcon} />
          {isVerticalOrientation ? 'Horizontal Mode' : 'Vertical Mode'}
        </button>

        {!isVerticalOrientation && (
          <button
            type="button"
            className={classnames(styles.titleBtn, 'btn-outline-primary btn btn-svg')}
            onClick={props.toggleTitleDisplay}
            disabled={props.showExamCalendar}
          >
            <Type className={styles.titleIcon} />
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
            <>
              <Grid className="svg svg-small" /> Timetable
            </>
          ) : (
            <>
              <Calendar className="svg svg-small" /> Exam Calendar
            </>
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
