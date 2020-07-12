import * as React from 'react';
import { range } from 'lodash';

import { convertIndexToTime } from 'utils/timify';
import styles from './TimetableTimings.scss';

type Props = {
  startingIndex: number;
  endingIndex: number;
};

const TimetableTimings: React.FC<Props> = (props) => {
  const indices = range(props.startingIndex, props.endingIndex);

  return (
    <div className={styles.timings}>
      {indices.map((i) => {
        const time = convertIndexToTime(i);

        // Only mark even ticks
        if (i % 2 === 1) return null;

        return (
          <time key={time} className={styles.time}>
            {time}
          </time>
        );
      })}
      <span />
    </div>
  );
};

export default TimetableTimings;
