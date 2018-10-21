// @flow

import React from 'react';
import { format } from 'date-fns';
import styles from './TodayContainer.scss';

type Props = {
  date: Date,
  dayName: ?string, // eg. Today, Tomorrow
};

function getDayName(date: Date) {
  return format(date, 'iiii, do MMMM');
}

export default function(props: Props) {
  return (
    <header className={styles.header}>
      <h2>
        <span className={styles.date}>{getDayName(props.date)}</span>
        {props.dayName}
      </h2>
    </header>
  );
}
