// @flow

import React from 'react';
import classnames from 'classnames';

import instructionImage from 'img/instructions.png';
import HighScoreTable from './HighScoreTable';
import TetrisLogo from './TetrisLogo';
import GameOverlay from './GameOverlay';

import styles from './overlay.scss';

type Props = {|
  +startGame: () => void,
|};

export default function GameStart(props: Props) {
  return (
    <GameOverlay>
      <TetrisLogo />

      <button
        className={classnames(styles.primaryBtn, 'btn btn-lg btn-primary')}
        type="button"
        onClick={props.startGame}
      >
        Start
      </button>

      <h3>How to Play</h3>
      <div>
        <img src={instructionImage} alt="" />
      </div>

      <section className={styles.scoreSection}>
        <div>
          <h3>Scores</h3>
          <table className={classnames(styles.scoreTable, 'table table-sm table-borderless ')}>
            <tbody>
              <tr>
                <th>Soft Drop</th>
                <td>1 &times; distance</td>
              </tr>
              <tr>
                <th>Hard Drop</th>
                <td>2 &times; distance</td>
              </tr>
              <tr>
                <th>1 row clear</th>
                <td>100</td>
              </tr>
              <tr>
                <th>2 rows clear</th>
                <td>300</td>
              </tr>
              <tr>
                <th>3 rows clear</th>
                <td>500</td>
              </tr>
              <tr>
                <th>4 rows clear</th>
                <td>800</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <HighScoreTable />
        </div>
      </section>
    </GameOverlay>
  );
}
