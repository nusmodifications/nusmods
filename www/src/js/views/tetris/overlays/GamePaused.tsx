// @flow

import React from 'react';
import classnames from 'classnames';

import GameOverlay from './GameOverlay';
import styles from './overlay.scss';

type Props = {|
  +score: number,
  +resumeGame: () => void,
|};

export default function GamePaused(props: Props) {
  return (
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
}
