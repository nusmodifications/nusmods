import * as React from 'react';
import { range } from 'lodash';

import { convertIndexToTime, NUM_INTERVALS_PER_HOUR } from 'utils/timify';
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
        // Only mark ticks for every hour
        if (i % NUM_INTERVALS_PER_HOUR !== 0) return null;

        const time = convertIndexToTime(i);
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
