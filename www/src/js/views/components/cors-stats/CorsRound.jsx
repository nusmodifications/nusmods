// @flow

import React, { type Element, type ElementType, Fragment } from 'react';
import { groupBy, map, size } from 'lodash';

import type { Faculty } from 'types/modules';
import type { GroupedBiddingStat } from 'types/cors';

import { GENERAL_ACCOUNT, NEW_STUDENT, RETURNING_STUDENT } from 'types/cors';
import CorsQuota from './CorsQuota';
import styles from './styles.scss';

type Props = {
  stats: GroupedBiddingStat[],
  showFaculty: boolean,
};

// Labels are not reused from CorsSummary because their length need to be shorter here
// to fit into the space available
const STUDENT_TYPE_LABELS = {
  [NEW_STUDENT]: 'New students',
  [RETURNING_STUDENT]: 'Returning students',
  [NEW_STUDENT | RETURNING_STUDENT]: 'Program Account',
  [RETURNING_STUDENT | GENERAL_ACCOUNT]: 'Program (Returning students) and General account',
  [GENERAL_ACCOUNT]: 'General account',
  [NEW_STUDENT | RETURNING_STUDENT | GENERAL_ACCOUNT]: 'All students',
};

function renderBidTableRow(stats: GroupedBiddingStat) {
  if (!stats.Bidders) {
    return (
      <td className={styles.noBids} colSpan="2">
        No bids
      </td>
    );
  }

  return (
    <Fragment>
      <td>
        <CorsQuota bidders={stats.Bidders} quota={stats.Quota} />
      </td>
      <td>{stats.LowestSuccessfulBid}</td>
    </Fragment>
  );
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
            {renderBidTableRow(stats)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Detailed bidding info for a single round. We first group by faculty then group
 * by studentType.
 */
function CorsRound(props: Props): Element<ElementType> | Element<ElementType>[] {
  const groupedByFaculty = groupBy(props.stats, (stats) => stats.Faculty);

  if (!size(groupedByFaculty)) {
    return <div className={styles.noBids}>No bidding during this round</div>;
  }

  return map(groupedByFaculty, (groupedStats: GroupedBiddingStat[], faculty: Faculty) => {
    const groupedByType = groupBy(groupedStats, (stats) => stats.StudentType);

    return (
      <div key={faculty} className={styles.facultyRow}>
        {props.showFaculty && <h5 className={styles.facultyHeading}>{faculty}</h5>}

        {map(groupedByType, (stats: GroupedBiddingStat[], type: string) => (
          <div key={type}>
            {size(groupedByType) > 1 && (
              <h6 className={styles.typeHeading}>{STUDENT_TYPE_LABELS[type]}</h6>
            )}
            {renderBidTable(stats)}
          </div>
        ))}
      </div>
    );
  });
}

export default CorsRound;
