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

function renderBidRow(stats: GroupedBiddingStat) {
  if (!stats.Bidders) {
    return <td className={styles.noBids} colSpan="2">No bids</td>;
  }

  return [
    <td className={styles.quota} key="quota">
      {stats.Bidders}/{stats.Quota}
    </td>,
    <td className={styles.bidPoints} key="bids">
      {stats.LowestSuccessfulBid}
    </td>,
  ];
}

function renderBidTable(groupedStats: GroupedBiddingStat[]) {
  return (
    <table className="table table-sm">
      <thead>
        <tr className={styles.headerRow}>
          <th />
          <th>Quota</th>
          <th>Bid</th>
        </tr>
      </thead>

      <tbody>
        {groupedStats.map((stats: GroupedBiddingStat) => (
          <tr key={stats.Round}>
            <th className={styles.roundName}>{stats.Round.charAt(1)}</th>
            {renderBidRow(stats)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function (props: Props) {
  const groupedByFaculty = groupBy(props.stats, stats => stats.Faculty);

  if (!size(groupedByFaculty)) {
    return <div className={styles.noBids}>No bidding during this round</div>;
  }

  return (
    <div>
      {map(groupedByFaculty, (groupedStats: GroupedBiddingStat[], faculty: Faculty) => {
        const groupedByLabel = groupBy(groupedStats, stats => STUDENT_TYPE_LABELS[stats.StudentType]);

        return (
          <div key={faculty} className={styles.facultyRow}>
            {size(groupedByFaculty) > 1 && <h5 className={styles.facultyHeading}>{faculty}</h5>}

            {map(groupedByLabel, (stats: GroupedBiddingStat[], label: string) => (
              <div key={label}>
                {size(groupedByLabel) > 1 && <h6 className={styles.typeHeading}>{label}</h6>}
                {renderBidTable(stats)}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
