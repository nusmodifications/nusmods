import classnames from 'classnames';
import * as React from 'react';

import { ColoredTimePeriod } from 'types/timePeriod';
import styles from './TimetableHighlight.scss';

type Props = {
  highlightPeriod: ColoredTimePeriod;
  style?: React.CSSProperties;
};

/**
 * A highlighted time period in the timetable.
 */
function TimetableHighlight(props: Props) {
  return (
    <div
      className={classnames(styles.row)}
      style={props.style} />
  )
}

export default TimetableHighlight;
