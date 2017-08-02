// @flow
import React from 'react';
import type { BiddingStat } from 'types/modules';
import Table from 'views/components/Table';

type Props = {
  aySem: string,
  stats: BiddingStat[],
};

const headers = [
  'Faculty',
  'Group',
  'Round',
  'Quota',
  'Bidders',
  'Lowest Bid',
  'Lowest Succ Bid',
  'Highest Bid',
  'Student Acct Type',
];

export default function CorsBiddingStatsTable(props: Props) {
  const data = (props.stats || []).map(s =>
    [
      s.Faculty,
      s.Group,
      s.Round,
      s.Quota,
      s.Bidders,
      s.LowestBid,
      s.LowestSuccessfulBid,
      s.HighestBid,
      s.StudentAcctType,
    ],
  );

  return (
    <Table
      title={props.aySem}
      headers={headers}
      data={data}
      noDataText="No rows"
    />
  );
}
