// @flow
import React from 'react';
import _ from 'lodash';

import { convertIndexToTime } from 'utils/timify';
import styles from './TimetableTimings.scss';

type Props = {
  startingIndex: number,
  endingIndex: number,
  currentDayIndex: number,
};

function TimetableTimings(props: Props) {
  const range = _.range(props.startingIndex, props.endingIndex);

  const currentDayStyle: Object = {
    color: 'text-primary',
  };

  return (
    <div className={styles.timings}>
      {range.map((i) => {
        const time = convertIndexToTime(i);
        if (i % 2 === 0) {
          return (
            <time key={time} className={styles.time} style={currentDayStyle}>
              {time}
            </time>
          );
        }
        return null;
      })}
      <span />
    </div>
  );
}

export default TimetableTimings;
