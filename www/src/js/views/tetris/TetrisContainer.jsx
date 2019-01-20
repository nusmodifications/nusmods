// @flow

import React, { PureComponent } from 'react';
import TetrisGame from './TetrisGame';

type Props = {||};

type State = {|
  +game: number,
|};

/**
 * Wrapper around TetrisGame which resets the game's internal state and components
 * by forcing a remount after each game via the key prop
 */
export default class TetrisContainer extends PureComponent<Props, State> {
  state = {
    game: 0,
  };

  onResetGame = () => {
    this.setState({ game: this.state.game + 1 });
  };

  render() {
    // Force a re-mount of the component, resetting its state by changing its key
    return <TetrisGame resetGame={this.onResetGame} key={this.state.game} />;
  }
}
