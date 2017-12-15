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
      className="btn-group btn-group-sm"
      role="group"
      aria-label="Timetable utilities"
    >
      <button
        type="button"
        className="btn btn-outline-primary"
        onClick={props.toggleTimetableOrientation}
      >
        <Sidebar
          className={classnames(styles.actionIcon, {
            [styles.verticalMode]: isVerticalOrientation,
            [styles.horizontalMode]: !isVerticalOrientation,
          })}
        />
        {isVerticalOrientation ? 'Vertical' : 'Horizontal'}
      </button>
      <button
        type="button"
        className="btn btn-outline-primary"
        onClick={props.downloadAsJpeg}
      >
        <Image className={styles.actionIcon} />
        Export image
      </button>
      <button
        type="button"
        className="btn btn-outline-primary"
        onClick={props.downloadAsIcal}
      >
        <Calendar className={styles.actionIcon} />
        Export iCal
      </button>
    </div>
  );
}

export default TimetableActions;
