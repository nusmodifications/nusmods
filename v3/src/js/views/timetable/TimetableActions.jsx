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

const VERTICAL_MODE_TEXT = 'Vertical Mode';
const HORIZONTAL_MODE_TEXT = 'Horizontal Mode';
const DOWNLOAD_IMAGE_TEXT = 'Download as Image';
const DOWNLOAD_ICAL_TEXT = 'Download as iCal';

function TimetableActions(props: Props) {
  const { isVerticalOrientation } = props;
  return (
    <div
      className="timetable-action-row btn-group"
      role="group"
      aria-label="Timetable utilities"
    >
      <button
        type="button"
        className="btn btn-outline-primary"
        title={isVerticalOrientation ? VERTICAL_MODE_TEXT : HORIZONTAL_MODE_TEXT}
        aria-label={isVerticalOrientation ? VERTICAL_MODE_TEXT : HORIZONTAL_MODE_TEXT}
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
        className="btn btn-outline-primary"
        title={DOWNLOAD_IMAGE_TEXT}
        aria-label={DOWNLOAD_IMAGE_TEXT}
        onClick={props.downloadAsJpeg}
      >
        <Image className={styles.actionIcon} />
      </button>
      <button
        type="button"
        className="btn btn-outline-primary"
        title={DOWNLOAD_ICAL_TEXT}
        aria-label={DOWNLOAD_ICAL_TEXT}
        onClick={props.downloadAsIcal}
      >
        <Calendar className={styles.actionIcon} />
      </button>
    </div>
  );
}

export default TimetableActions;
