import * as React from 'react';
import { getScoreData } from './score';

const HighScoreTable: React.FC = () => {
  const highScores = getScoreData();

  return (
    <div>
      <h3>High Scores</h3>
      {highScores.length > 0 ? (
        <table className="table table-sm table-borderless">
          <tbody>
            {highScores.map((entry, index) => (
              <tr key={entry.time}>
                <th>{index + 1}</th>
                <td className="text-right">{entry.name}</td>
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
};

export default HighScoreTable;
