// @flow

import React from 'react';
import { map, size } from 'lodash';

import type { BiddingSummary } from 'types/views';
import { GENERAL_ACCOUNT, NEW_STUDENT, RETURNING_STUDENT } from 'types/views';
import styles from './CorsStats.scss';

type Props = {
  summary: BiddingSummary,
};

const STUDENT_TYPE_LABELS = {
  [NEW_STUDENT]: 'Program (New Student)',
  [RETURNING_STUDENT]: 'Program (Returning Student)',
  [GENERAL_ACCOUNT]: 'General Account',
};

export default function (props: Props) {
  const { summary } = props;

  return (
    <div>
      {map(summary, (facultyStats, name) => (
        <div key={name}>
          {size(summary) > 1 && <h5 className={styles.facultyHeading}>{name}</h5>}
          <div className="row">
            {map(facultyStats, ({ minBid, round }, type) => (
              <div key={type} className="col-4">
                <h6 className={styles.typeHeading}>{STUDENT_TYPE_LABELS[type]}</h6>
                <p><strong className={styles.minBid}>{minBid}</strong> {minBid === 1 ? 'point' : 'points'}
                  <span className={styles.roundInfo}>Round {round}</span></p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
