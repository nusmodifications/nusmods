// @flow
import React from 'react';
import { Sidebar, Image, Calendar } from 'views/components/icons/index';
import classnames from 'classnames';

import styles from './TimetableActions.scss';

type Props = {
  isVerticalOrientation: boolean,
  toggleTimetableOrientation: Function,
  downloadAsJpeg: Function,
  downloadAsIcal: Function,
};

function TimetableActions(props: Props) {
  const { isVerticalOrientation } = props;
  return (
    <div
      className="timetable-action-row btn-group text-xs-right"
      role="group"
      aria-label="Timetable utilities"
    >
      <button
        type="button"
        className={`btn btn-outline-primary ${styles.actionButton}`}
        title={isVerticalOrientation ? 'Vertical Mode' : 'Horizontal Mode'}
        aria-label={isVerticalOrientation ? 'Vertical Mode' : 'Horizontal Mode'}
        onClick={props.toggleTimetableOrientation}
      >
        <Sidebar
          className={classnames(styles.actionIcon, {
            [styles.verticalMode]: isVerticalOrientation,
            [styles.horizontalMode]: !isVerticalOrientation,
          })}
        />
      </button>
      <button
        type="button"
        className={`btn btn-outline-primary ${styles.actionButton}`}
        title="Download as Image"
        aria-label="Download as Image"
        onClick={props.downloadAsJpeg}
      >
        <Image className={styles.actionIcon} />
      </button>
      <button
        type="button"
        className={`btn btn-outline-primary ${styles.actionButton}`}
        title="Download as iCal"
        aria-label="Download as iCal"
        onClick={props.downloadAsIcal}
      >
        <Calendar className={styles.actionIcon} />
      </button>
    </div>
  );
}

export default TimetableActions;
