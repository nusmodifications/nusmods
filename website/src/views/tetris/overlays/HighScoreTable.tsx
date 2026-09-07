import { Table, TableBody, TableRow, TableHead, TableCell } from 'components/ui/table';
import * as React from 'react';
import { getScoreData } from './score';

const HighScoreTable: React.FC = () => {
  const highScores = getScoreData();

  return (
    <div>
      <h3>High Scores</h3>
      {highScores.length > 0 ? (
        <Table className="table table-sm table-borderless">
          <TableBody>
            {highScores.map((entry, index) => (
              <TableRow key={entry.time}>
                <TableHead>{index + 1}</TableHead>
                <TableCell className="text-right">{entry.name}</TableCell>
                <TableCell>{entry.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>No high scores yet!</p>
      )}
    </div>
  );
};

export default HighScoreTable;
