import { shallow } from 'enzyme';
import _ from 'lodash';

import TetrisGame from './TetrisGame';

describe(TetrisGame, () => {
  test('integration test', () => {
    // Randomly play the game for 250 turns 20 times to check the game
    // at least won't crash
    const wrapper = shallow(<TetrisGame resetGame={jest.fn()} />);
    const instance = wrapper.instance() as TetrisGame;

    const moves = [
      () => instance.hardDrop(),
      () => instance.rotatePiece('left'),
      () => instance.rotatePiece('right'),
      () => instance.moveDown(),
      () => instance.movePieceHorizontal(1),
      () => instance.movePieceHorizontal(-1),
      () => instance.holdPiece(),
      () => instance.onTick(),
    ];

    instance.startGame();

    for (let game = 0; game < 20; game++) {
      for (let tick = 0; tick < 250; tick++) {
        _.sample(moves)!();
        wrapper.render();

        if (!instance.isPlaying()) break;
      }
    }
  });
});
