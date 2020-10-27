import React, { useCallback, useState } from 'react';
import TetrisGame from './TetrisGame';

/**
 * Wrapper around TetrisGame which resets the game's internal state and
 * components by forcing a remount after each game via the key prop.
 */
const TetrisContainer: React.FC = () => {
  const [game, setGame] = useState(0);
  const onResetGame = useCallback(() => setGame(game + 1), [game]);
  return <TetrisGame key={game} resetGame={onResetGame} />;
};

export default TetrisContainer;
