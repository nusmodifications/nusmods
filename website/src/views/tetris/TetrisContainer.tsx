import * as React from 'react';
import Loadable, { LoadingComponentProps } from 'react-loadable';

import type { EmptyProps } from 'types/utils';
import ApiError from 'views/errors/ApiError';
import LoadingSpinner from 'views/components/LoadingSpinner';
import type { Props as TetrisGameProps } from './TetrisGame';

type Props = {
  readonly TetrisGame: React.ComponentType<TetrisGameProps>;
};

type State = {
  readonly game: number;
};

/**
 * Wrapper around TetrisGame which resets the game's internal state and components
 * by forcing a remount after each game via the key prop
 */
class TetrisContainer extends React.PureComponent<Props, State> {
  state = {
    game: 0,
  };

  onResetGame = () => {
    this.setState((state) => ({ game: state.game + 1 }));
  };

  render() {
    const { TetrisGame } = this.props;
    // Force a re-mount of the component, resetting its state by changing its key
    return <TetrisGame resetGame={this.onResetGame} key={this.state.game} />;
  }
}

/**
 * Lazy load the TetrisGame component and pass it down to TetrisContainer
 */
type Export = { TetrisGame: { default: React.ComponentType<TetrisGameProps> } };
export default Loadable.Map<EmptyProps, Export>({
  loader: {
    TetrisGame: () => import(/* webpackChunkName: "tetris" */ './TetrisGame'),
  },
  loading: (props: LoadingComponentProps) => {
    if (props.error) {
      return <ApiError dataName="the page" retry={props.retry} />;
    }

    if (props.pastDelay) {
      return <LoadingSpinner />;
    }

    return null;
  },
  render(loaded, props) {
    return <TetrisContainer TetrisGame={loaded.TetrisGame.default} {...props} />;
  },
});
