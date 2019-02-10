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
      {props.data.map((rowData, rowIndex) => (
        <tr key={rowIndex}>
          {rowData.map((cellData, cellIndex) => (
            <td key={cellIndex}>{cellData}</td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  const tableHeader = (
    <thead>
      <tr>
        {props.headers.map((headerData, index) => (
          <th key={index}>{headerData}</th>
        ))}
      </tr>
    </thead>
  );

  return props.data.length === 0 ? (
    <p>{props.noDataText}</p>
  ) : (
    <div className="table-responsive">
      {props.title && <h3 className="table-title">{props.title}</h3>}
      <table className="table table-sm">
        {tableHeader}
        {tableBody}
      </table>
    </div>
  );
}
