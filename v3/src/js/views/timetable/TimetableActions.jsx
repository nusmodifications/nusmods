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
        className="btn btn-outline-primary"
        title={isVerticalOrientation ? 'Vertical Mode' : 'Horizontal mode'}
        aria-label={isVerticalOrientation ? 'Vertical Mode' : 'Horizontal mode'}
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
        title="Download as Image"
        aria-label="Download as Image"
        className="btn btn-outline-primary"
        onClick={props.downloadAsJpeg}
      >
        <Image className={styles.actionIcon} />
      </button>
      <button
        type="button"
        title="Download as iCal"
        aria-label="Download as iCal"
        className="btn btn-outline-primary"
        onClick={props.downloadAsIcal}
      >
        <Calendar className={styles.actionIcon} />
      </button>
    </div>
  );
}

export default TimetableActions;
