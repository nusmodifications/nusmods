import * as React from 'react';
import classnames from 'classnames';

import GameOverlay from './GameOverlay';
import styles from './overlay.scss';

type Props = {
  readonly score: number;
  readonly resumeGame: () => void;
};

const GamePaused: React.FC<Props> = (props) => (
  <GameOverlay>
    <h2>Game Paused</h2>
    <p>
      Score: <strong className={styles.finalScore}>{props.score}</strong>
    </p>
    <button
      className={classnames('btn btn-lg btn-primary')}
      type="button"
      onClick={props.resumeGame}
    >
      Resume
    </button>
  </GameOverlay>
);

export default GamePaused;
