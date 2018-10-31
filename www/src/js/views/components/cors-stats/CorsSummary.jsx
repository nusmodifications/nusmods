// @flow

import React, { type Element, type ElementType } from 'react';
import { map, size } from 'lodash';

import type { BiddingSummary } from 'types/cors';
import { GENERAL_ACCOUNT, NEW_STUDENT, RETURNING_STUDENT } from 'types/cors';
import styles from './styles.scss';

type Props = {
  summary: BiddingSummary,
};

const STUDENT_TYPE_LABELS = {
  [NEW_STUDENT]: 'Program (New Student)',
  [RETURNING_STUDENT]: 'Program (Returning Student)',
  [GENERAL_ACCOUNT]: 'General Account',
};

/**
 * Summary statistics consists of minimum amount of bid points required
 * to get a module for each type of student in each faculty
 */
export default function(props: Props): Element<ElementType>[] {
  const { summary } = props;

  return map(summary, (facultyStats, name) => (
    <div key={name}>
      {size(summary) > 1 && <h5 className={styles.facultyHeading}>{name}</h5>}

      <div className="row">
        {map(facultyStats, ({ minBid, round }, type) => (
          <div key={type} className="col-4">
            <h6 className={styles.typeHeading}>{STUDENT_TYPE_LABELS[type]}</h6>
            <p>
              <strong className={styles.minBid}>{minBid}</strong>{' '}
              {minBid === 1 ? 'point' : 'points'}
              <span className={styles.roundInfo}>Round {round}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  ));
}
