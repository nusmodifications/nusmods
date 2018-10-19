// @flow

import React from 'react';
import { DaysOfWeek } from 'types/modules';
import { getDayIndex } from 'utils/timify';
import styles from './TodayContainer.scss';

type Props = {
  date: Date,
  dayName: ?string, // eg. Today, Tomorrow
};

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function getDayName(date: Date) {
  return `${DaysOfWeek[getDayIndex(date)]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
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
