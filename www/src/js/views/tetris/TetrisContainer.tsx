// @flow

import React, { type ComponentType, PureComponent } from 'react';
import Loadable, { type LoadingProps } from 'react-loadable';
import ApiError from 'views/errors/ApiError';
import LoadingSpinner from 'views/components/LoadingSpinner';

type Props = {|
  +TetrisGame: ComponentType,
|};

type State = {|
  +game: number,
|};

/**
 * Wrapper around TetrisGame which resets the game's internal state and components
 * by forcing a remount after each game via the key prop
 */
class TetrisContainer extends PureComponent<Props, State> {
  state = {
    game: 0,
  };

  onResetGame = () => {
    this.setState({ game: this.state.game + 1 });
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
export default Loadable.Map<{}, *>({
  loader: {
    TetrisGame: () => import(/* webpackChunkName: "tetris" */ './TetrisGame'),
  },
  loading: (props: LoadingProps) => {
    if (props.error) {
      return <ApiError dataName="the page" retry={props.retry} />;
    } else if (props.pastDelay) {
      return <LoadingSpinner />;
    }

    return null;
  },
  render(loaded, props) {
    return <TetrisContainer TetrisGame={loaded.TetrisGame.default} {...props} />;
  },
});
