import classnames from 'classnames';
import * as React from 'react';

import styles from './TimetableHighlight.scss';

type Props = {
  style?: React.CSSProperties;
  className?: string;
};

/**
 * A highlighted time period in the timetable.
 */
function TimetableHighlight(props: Props) {
  return <div className={classnames(styles.highlight, props.className)} style={props.style} />;
}

export default TimetableHighlight;
