// @flow

import React from 'react';
import classnames from 'classnames';

import styles from './CorsStats.scss';

type Props = {
  bidders: number,
  quota: number,
};

export default function ({ bidders, quota }: Props) {
  let color = 'success';
  if (bidders / quota > 0.85) color = 'warning';
  if (bidders / quota >= 1) color = 'danger';

  return (
    <span className={classnames(`text-${color}`, styles.quota)}>
      <span className={styles.bidders}>{bidders}</span>
      <span className={styles.slash}>/</span>
      <span className={styles.available}>{quota}</span>
    </span>
  );
}
