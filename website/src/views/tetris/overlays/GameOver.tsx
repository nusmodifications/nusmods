import * as React from 'react';
import classnames from 'classnames';

import HighScoreForm from './HighScoreForm';
import GameOverlay from './GameOverlay';
import styles from './overlay.scss';

type Props = {
  readonly score: number;
  readonly resetGame: () => void;
};

const GameOver: React.FC<Props> = (props) => (
  <GameOverlay>
    <h2>Game Over!</h2>
    <p>
      Final Score: <strong className={styles.finalScore}>{props.score}</strong>
    </p>

    <HighScoreForm score={props.score} />

    <button
      className={classnames('btn btn-lg btn-primary')}
      type="button"
      onClick={props.resetGame}
    >
      Continue
    </button>
  </GameOverlay>
);

export default GameOver;
