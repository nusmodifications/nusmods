import { Button } from 'components/ui/button';
import { Table, TableBody, TableRow, TableHead, TableCell } from 'components/ui/table';
import * as React from 'react';
import classnames from 'classnames';

import instructionImage from 'img/instructions.png';
import HighScoreTable from './HighScoreTable';
import TetrisLogo from './TetrisLogo';
import GameOverlay from './GameOverlay';

import styles from './overlay.scss';

type Props = {
  readonly startGame: () => void;
};

const GameStart: React.FC<Props> = (props) => (
  <GameOverlay>
    <TetrisLogo />

    <Button
      variant="default"
      size="lg"
      className={classnames(styles.primaryBtn, ' ')}
      type="button"
      onClick={props.startGame}
    >
      Start
    </Button>

    <h3>How to Play</h3>
    <div>
      <img src={instructionImage} alt="" />
    </div>

    <section className={styles.scoreSection}>
      <div>
        <h3>Scores</h3>
        <Table className={classnames(styles.scoreTable, 'table table-sm table-borderless ')}>
          <TableBody>
            <TableRow>
              <TableHead>Soft Drop</TableHead>
              <TableCell>1 &times; distance</TableCell>
            </TableRow>
            <TableRow>
              <TableHead>Hard Drop</TableHead>
              <TableCell>2 &times; distance</TableCell>
            </TableRow>
            <TableRow>
              <TableHead>1 row clear</TableHead>
              <TableCell>100</TableCell>
            </TableRow>
            <TableRow>
              <TableHead>2 rows clear</TableHead>
              <TableCell>300</TableCell>
            </TableRow>
            <TableRow>
              <TableHead>3 rows clear</TableHead>
              <TableCell>500</TableCell>
            </TableRow>
            <TableRow>
              <TableHead>4 rows clear</TableHead>
              <TableCell>800</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div>
        <HighScoreTable />
      </div>
    </section>
  </GameOverlay>
);

export default GameStart;
