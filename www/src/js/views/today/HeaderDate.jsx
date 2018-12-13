// @flow

import React from 'react';
import { format } from 'date-fns';
import styles from './TodayContainer.scss';

// Get the subtitle and title headings
type Props = {|
  +children: Date,
  +offset: number,
|};

export default function HeaderDate({ children, offset }: Props) {
  let title;
  let subtitle;

  if (offset < 2) {
    title = offset === 0 ? 'Today' : 'Tomorrow';
    subtitle = format(children, 'iiii, do MMMM');
  } else {
    title = format(children, 'iiii');
    subtitle = format(children, 'do MMMM');
  }

  return (
    <time dateTime={children.toISOString()}>
      <span className={styles.date}>{subtitle}</span>
      {title}
    </time>
  );
}
