// @flow

import React from 'react';
import classnames from 'classnames';
import { groupBy, map, size } from 'lodash';
import type { GroupedBiddingStat } from 'types/views';
import styles from './CorsStats.scss';

type Props = {
  stats: GroupedBiddingStat[],
};

const ACCOUNT_TYPE_LABELS = {
  // Round 1 and 2
  'New Students [P]': 'New students',
  'Returning Students [P]': 'Returning students',

  'NUS Students [P]': 'Program Account',
  'Returning Students and New Students [P]': 'Program account',
  'NUS Students [G]': 'General account',
  'Returning Students [P] and NUS Students [G]': 'Returning students',

  // Round 3
  'NUS Students [P, G]': 'All students',

  // Do not display these
  'Reserved for [G] in later round': null,
  'Not Available for [G]': null,
};


export default function (props: Props) {
  const groupedByFaculty = groupBy(props.stats, stats => stats.Faculty);

  return (
    <div>
      {map(groupedByFaculty, (groupedStats, faculty) => {
        const groupedByLabel = groupBy(groupedStats, stats => ACCOUNT_TYPE_LABELS[stats.StudentAcctType]);

        return (
          <div key={faculty} className={styles.facultyRow}>
            {size(groupedByFaculty) > 1 && <h5 className={styles.facultyHeading}>{faculty}</h5>}

            {map(groupedByLabel, (grouped, label) => {
              if (label === 'null') return null;

              return (
                <div key={label}>
                  {size(groupedByLabel) > 1 && <h6 className={styles.typeHeading}>{label}</h6>}
                  <div className="row">
                    {grouped.map(stats => (
                      <div key={stats.Round} className={classnames('col')}>
                        <strong>{stats.Round}</strong> {stats.Bidders ?
                          <span>{stats.Bidders}/{stats.Quota} - {stats.LowestSuccessfulBid}pts</span> :
                          <span>No bids</span>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
