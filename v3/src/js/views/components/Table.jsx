// @flow
import React from 'react';

type Props = {
  title: string | void,
  data: Array<Array<any>>,
  headers: string[],
  noDataText: string,
};

export default function Table(props: Props) {
  const tableBody = (
    <tbody>
      {props.data.map(s =>
        <tr key={s}>
          {s.map(d =>
            <td key={d}>
              {d}
            </td>,
          )}
        </tr>,
      )}
    </tbody>
  );

  const tableHeader = (
    <thead>
      <tr>
        {props.headers.map(h => <th key={h}>{h}</th>)}
      </tr>
    </thead>
  );

  return props.data.length === 0 ?
    <p>{props.noDataText}</p>
    :
    <div className="table-responsive">
      {props.title ? <h3 className="table-title">{props.title}</h3> : null }
      <table className="table table-sm">
        {tableHeader}
        {tableBody}
      </table>
    </div>;
}
