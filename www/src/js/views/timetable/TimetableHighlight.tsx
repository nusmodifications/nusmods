import classnames from 'classnames';
import * as React from 'react';

// import { HoverLesson } from 'types/timetables';

import { ColoredTimePeriod } from '../../types/timePeriod';
// import elements from '../elements';
import styles from './TimetableHighlight.scss';

// import styles from './TimetableHighlight.scss';

type Props = {
  highlightPeriod: ColoredTimePeriod;
  size: number;
  style?: React.CSSProperties;
  // hoverLesson?: HoverLesson | null;
};

/**
 * A highlighted time period in the timetable.
 */
function TimetableHighlight(props: Props) {
  const rowStyle: React.CSSProperties = {
    // Firefox defaults the second value (width) to auto if not specified
    backgroundSize: `${props.size}% ${props.size}%`,
  };

  return (
    <div
      // className={classnames(styles.row, `highlightPeriod color-${props.highlightPeriod.colorIndex}`)}
      className={classnames(styles.row, `highlightPeriod`)}
      // style={rowStyle}
      style={props.style} />
  )
}

export default TimetableHighlight;
