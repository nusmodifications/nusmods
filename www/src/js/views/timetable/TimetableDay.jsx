// @flow
import React from 'react';

import type { TimetableDayArrangement } from 'types/timetables';

import styles from './TimetableDay.scss';
import TimetableRow from './TimetableRow';

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
  const rowStyle: Object = {
    // Firefox defaults the second value (width) to auto if not specified
    backgroundSize: `${size}% ${size}%`,
  };

  if (props.isCurrentDay) rowStyle.boxShadow = 'inset 0 0 0 99999px rgba(128, 128, 128, 0.1)';
  if (props.verticalMode) rowStyle.height = `${VERTICAL_HEIGHT * columns}rem`;

  return (
    <li className={styles.day}>
      <div className={styles.dayName}>
        <span className={styles.dayNameText}>{props.day.substring(0, 3)}</span>
      </div>
      <div className={styles.dayRows} style={rowStyle}>
        {props.dayLessonRows.map((dayLessonRow, i) => (
          <TimetableRow
            key={i}
            isCurrentDay={props.isCurrentDay}
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
