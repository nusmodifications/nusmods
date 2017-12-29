// @flow
import React from 'react';
import classnames from 'classnames';

import type { TimetableDayArrangement } from 'types/timetables';

import { getCurrentSingaporeHours, getCurrentSingaporeMinutes } from 'utils/timify';
import styles from './TimetableDay.scss';
import TimetableRow from './TimetableRow';
import CurrentTimeIndicator from './CurrentTimeIndicator';

type Props = {
  day: string,
  isCurrentDay: boolean,
  dayLessonRows: TimetableDayArrangement,
  verticalMode: boolean,
  startingIndex: number,
  endingIndex: number,
  onModifyCell: Function,
};

// Height of timetable per hour in vertical mode
const VERTICAL_HEIGHT = 2;

function TimetableDay(props: Props) {
  const columns = props.endingIndex - props.startingIndex;
  const size = 100 / (columns / 4);
  const dirStyle = props.verticalMode ? 'top' : 'marginLeft';
  const rowStyle: Object = {
    // Firefox defaults the second value (width) to auto if not specified
    backgroundSize: `${size}% ${size}%`,
  };

  if (props.verticalMode) rowStyle.height = `${VERTICAL_HEIGHT * columns}rem`;

  // Calculate the margin offset for the CurrentTimeIndicator
  const currentHours = getCurrentSingaporeHours();
  const currentMinutes = getCurrentSingaporeMinutes();
  const hoursMarginOffset = (currentHours * 2 - props.startingIndex) / columns * 100;
  const minutesMarginOffset = currentMinutes / 30 / columns * 100;
  const timeIndicatorIsVisible =
    currentHours * 2 >= props.startingIndex && currentHours * 2 < props.endingIndex;
  const currentTimeIndicatorStyle: Object = {
    [dirStyle]: `${hoursMarginOffset + minutesMarginOffset}%`,
  };

  return (
    <li className={styles.day}>
      <div className={styles.dayName}>
        <span className={styles.dayNameText}>{props.day.substring(0, 3)}</span>
      </div>
      <div
        className={classnames(styles.dayRows, { [styles.currentDay]: props.isCurrentDay })}
        style={rowStyle}
      >
        {props.isCurrentDay &&
          timeIndicatorIsVisible && <CurrentTimeIndicator style={currentTimeIndicatorStyle} />}
        {props.dayLessonRows.map((dayLessonRow, i) => (
          <TimetableRow
            key={i}
            startingIndex={props.startingIndex}
            endingIndex={props.endingIndex}
            verticalMode={props.verticalMode}
            lessons={dayLessonRow}
            onModifyCell={props.onModifyCell}
          />
        ))}
      </div>
    </li>
  );
}

export default TimetableDay;
