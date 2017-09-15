// @flow
import React from 'react';

import type { TimetableDayArrangement } from 'types/timetables';

import styles from './TimetableDay.scss';
import TimetableRow from './TimetableRow';

type Props = {
  day: string,
  dayLessonRows: TimetableDayArrangement,
  verticalMode: boolean,
  startingIndex: number,
  endingIndex: number,
  onModifyCell: Function,
};

function TimetableDay(props: Props) {
  const columns = props.endingIndex - props.startingIndex;
  const rowStyle = {
    backgroundSize: `${100 / (columns / 4)}%`,
  };
  return (
    <li className={styles.day}>
      <div className={styles.dayName}>
        {props.day.substring(0, 3)}
      </div>
      <div className={styles.dayRows} style={rowStyle}>
        {
          props.dayLessonRows.map((dayLessonRow, i) => {
            return (
              <TimetableRow
                key={i}
                startingIndex={props.startingIndex}
                endingIndex={props.endingIndex}
                verticalMode={props.verticalMode}
                lessons={dayLessonRow}
                onModifyCell={props.onModifyCell}
              />
            );
          })
        }
      </div>
    </li>
  );
}

export default TimetableDay;
