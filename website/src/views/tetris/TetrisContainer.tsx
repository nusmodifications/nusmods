import React, { lazy, memo, Suspense, useCallback, useState } from 'react';

import ApiError from 'views/errors/ApiError';
import LoadingSpinner from 'views/components/LoadingSpinner';
import ErrorBoundary from 'views/errors/ErrorBoundary';
import type { Props as TetrisGameProps } from './TetrisGame';

// Source: https://github.com/facebook/react/issues/14254#issuecomment-441717770
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function retryableLazy<T extends React.ComponentType<any>>(
  lazyImport: () => Promise<{ default: T }>,
  setComponent: (component: React.LazyExoticComponent<T>) => void,
) {
  setComponent(
    lazy(() =>
      lazyImport().catch((err) => {
        retryableLazy(lazyImport, setComponent);
        throw err;
      }),
    ),
  );
}

let TetrisGame: React.ComponentType<TetrisGameProps>;
retryableLazy(
  () => import(/* webpackChunkName: "tetris" */ './TetrisGame'),
  (component) => {
    TetrisGame = component;
  },
);

/**
 * Wrapper around TetrisGame which:
 * - Lazy loads the TetrisGame component.
 * - Resets the game's internal state and components by forcing a remount after
 *   each game via the key prop
 */
const TetrisContainer = memo(() => {
  const [game, setGame] = useState(0);
  const onResetGame = useCallback(() => setGame(game + 1), [game]);

  return (
    <ErrorBoundary
      key={game}
      errorPage={() => <ApiError dataName="the page" retry={onResetGame} />}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <TetrisGame resetGame={onResetGame} />;
      </Suspense>
    </ErrorBoundary>
  );
});

export default TetrisContainer;
