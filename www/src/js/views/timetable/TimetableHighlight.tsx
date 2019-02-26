import classnames from 'classnames';
import * as React from 'react';

import { TimePeriod } from 'types/timePeriod';
import styles from './TimetableHighlight.scss';

type Props = {
  highlightPeriod: TimePeriod;
  style?: React.CSSProperties;
};

/**
 * A highlighted time period in the timetable.
 */
function TimetableHighlight(props: Props) {
  return <div className={classnames(styles.highlight)} style={props.style} />;
}

export default TimetableHighlight;
