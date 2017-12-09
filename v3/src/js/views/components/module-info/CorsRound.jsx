// @flow

import React from 'react';
import { groupBy, map, size } from 'lodash';

import type { Faculty } from 'types/modules';
import type { GroupedBiddingStat } from 'types/views';

import { GENERAL_ACCOUNT, NEW_STUDENT, RETURNING_STUDENT } from 'types/views';
import styles from './CorsStats.scss';

type Props = {
  stats: GroupedBiddingStat[],
};

const STUDENT_TYPE_LABELS = {
  [NEW_STUDENT]: 'New students',
  [RETURNING_STUDENT]: 'Returning students',
  [NEW_STUDENT | RETURNING_STUDENT]: 'Program Account',
  [RETURNING_STUDENT | GENERAL_ACCOUNT]: 'Program (Returning students) and General account',
  [GENERAL_ACCOUNT]: 'General account',
  [NEW_STUDENT | RETURNING_STUDENT | GENERAL_ACCOUNT]: 'All students',
};

export default function (props: Props) {
  const groupedByFaculty = groupBy(props.stats, stats => stats.Faculty);
  if (!size(groupedByFaculty)) return <div>No bidding during this round</div>;

  return (
    <div>
      {map(groupedByFaculty, (groupedStats: GroupedBiddingStat[], faculty: Faculty) => {
        const groupedByLabel = groupBy(groupedStats, stats => STUDENT_TYPE_LABELS[stats.StudentType]);

        return (
          <div key={faculty} className={styles.facultyRow}>
            {size(groupedByFaculty) > 1 && <h5 className={styles.facultyHeading}>{faculty}</h5>}

            {map(groupedByLabel, (grouped: GroupedBiddingStat[], label: string) => {
              if (label === 'null') return null;

              return (
                <div key={label}>
                  {size(groupedByLabel) > 1 && <h6 className={styles.typeHeading}>{label}</h6>}
                  {grouped.map((stats: GroupedBiddingStat) => (
                    <div key={stats.Round}>
                      <span>{stats.Round.charAt(1)}</span>
                      {stats.Bidders ?
                        <span>{stats.Bidders}/{stats.Quota} - <strong>{stats.LowestSuccessfulBid}pt</strong></span> :
                        <span>No bids</span>
                      }
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
