import React from 'react';
import { shallow } from 'enzyme';
import _ from 'lodash';

import TetrisGame from './TetrisGame';

describe(TetrisGame, () => {
  test('integration test', () => {
    // Randomly play the game for 1000 turns 100 times to check the game
    // at least won't crash
    const wrapper = shallow(<TetrisGame resetGame={jest.fn()} />);
    const instance = wrapper.instance() as TetrisGame;

    const moves = Object.entries({
      hardDrop: () => instance.hardDrop(),
      rotateLeft: () => instance.rotatePiece('left'),
      rotateRight: () => instance.rotatePiece('right'),
      moveDown: () => instance.moveDown(),
      moveRight: () => instance.movePieceHorizontal(1),
      moveLeft: () => instance.movePieceHorizontal(-1),
      holdPiece: () => instance.holdPiece(),
      onTick: () => instance.onTick(),
    });

    instance.startGame();

    for (let game = 0; game < 100; game++) {
      // Keep a list of moves made for debugging
      const currentMoves: string[] = []
      try {
        for (let tick = 0; tick < 1000; tick++) {
          const [moveLabel, move] = _.sample(moves)!
          currentMoves.push(moveLabel);
          move();
          wrapper.render();

          if (!instance.isPlaying()) break;
        }
      } catch (e) {
        console.log(currentMoves);
        throw e;
      }
    }
  });
});
