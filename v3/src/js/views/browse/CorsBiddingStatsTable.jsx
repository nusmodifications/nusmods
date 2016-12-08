// @flow
import React from 'react';
import { BiddingStat } from 'types/modules';

type Props = {
  stats: BiddingStat[]
}

export default function CorsBiddingStatsTable(props: Props) {
  const stats = props.stats || [];
  const rows = stats.map((s, i) =>
    <tr key={i}>
      <td>{s.Faculty}</td>
      <td>{s.Group}</td>
      <td>{s.Round}</td>
      <td>{s.Quota}</td>
      <td>{s.Bidders}</td>
      <td>{s.LowestBid}</td>
      <td>{s.LowestSuccessfulBid}</td>
      <td>{s.HighestBid}</td>
      <td>{s.StudentAcctType}</td>
    </tr>
  );

  return (
    <div className="table-responsive">
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Faculty</th>
            <th>Group</th>
            <th>Round</th>
            <th>Quota</th>
            <th>Bidders</th>
            <th>Lowest Bid</th>
            <th>Lowest Succ Bid</th>
            <th>Highest Bid</th>
            <th>Student Acct Type</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  );
}
