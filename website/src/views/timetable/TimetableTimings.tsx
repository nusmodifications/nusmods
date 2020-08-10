import * as React from 'react';
import { range } from 'lodash';
import classnames from 'classnames';

import { ChevronLeft, ChevronRight } from 'react-feather';

import { convertIndexToTime } from 'utils/timify';
import styles from './TimetableTimings.scss';

type Props = {
  startingIndex: number;
  endingIndex: number;
  onChangeEarliestIndexPreference: (amount: number) => void;
  onChangeLatestIndexPreference: (amount: number) => void;
};

const TimetableTimings: React.FC<Props> = (props) => {
  const indices = range(props.startingIndex, props.endingIndex);

  return (
    <div className={styles.relative}>
      <div className={styles.buttonLeft}>
        <button
          className={classnames('btn btn-inline')}
          type="button"
          aria-label="Previous Start Hour"
          disabled={props.startingIndex <= 12}
          onClick={() => props.onChangeEarliestIndexPreference(-1)}
        >
          <ChevronLeft className={styles.svg} />
        </button>
        <button
          className={classnames('btn btn-inline')}
          type="button"
          aria-label="Next Start Hour"
          disabled={props.endingIndex - props.startingIndex <= 4}
          onClick={() => props.onChangeEarliestIndexPreference(1)}
        >
          <ChevronRight className={styles.svg} />
        </button>
      </div>
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
      <div className={styles.buttonRight}>
        <button
          className={classnames('btn btn-inline')}
          type="button"
          aria-label="Previous End Hour"
          disabled={props.endingIndex - props.startingIndex <= 4}
          onClick={() => props.onChangeLatestIndexPreference(-1)}
        >
          <ChevronLeft className={styles.svg} />
        </button>
        <button
          className={classnames('btn btn-inline')}
          type="button"
          aria-label="Next End Hour"
          disabled={props.endingIndex >= 48}
          onClick={() => props.onChangeLatestIndexPreference(1)}
        >
          <ChevronRight className={styles.svg} />
        </button>
      </div>
    </div>
  );
};

export default TimetableTimings;
