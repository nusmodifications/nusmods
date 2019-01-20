// @flow

import React from 'react';
import { getScoreData } from './score';

export default function HighScoreTable() {
  const highScores = getScoreData();

  return (
    <div>
      <h3>High Scores</h3>
      {highScores.length > 0 ? (
        <table className="table table-sm table-borderless">
          <tbody>
            {highScores.map((entry) => (
              <tr key={entry.time}>
                <th>{entry.name}</th>
                <td>{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No high scores yet!</p>
      )}
    </div>
  );
}
