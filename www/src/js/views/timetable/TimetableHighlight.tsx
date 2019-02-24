import classnames from 'classnames';
import * as React from 'react';

// import { HoverLesson } from 'types/timetables';

import { ColoredTimePeriod } from '../../types/timePeriod';
// import elements from '../elements';
import styles from './TimetableHighlight.scss';

// import styles from './TimetableHighlight.scss';

type Props = {
  highlightPeriod: ColoredTimePeriod;
  style?: React.CSSProperties;
  // hoverLesson?: HoverLesson | null;
};

/**
 * A highlighted time period in the timetable.
 */
function TimetableHighlight(props: Props) {
  return (
    <div
      // className={classnames(styles.row, `highlightPeriod color-${props.highlightPeriod.colorIndex}`)}
      className={classnames(styles.row, `highlightPeriod`)}
      style={props.style} />
  )
}

export default TimetableHighlight;
