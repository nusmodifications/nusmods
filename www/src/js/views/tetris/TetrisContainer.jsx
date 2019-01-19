// @flow

import React, { PureComponent } from 'react';
import Mousetrap from 'mousetrap';
import { range, sample } from 'lodash';
import classnames from 'classnames';
import produce from 'immer';

import Timetable from 'views/timetable/Timetable';
import type { Board, Piece } from './board';
import {
  ROWS,
  COLUMNS,
  makePiece,
  boardToTimetableArrangement,
  placePieceOnBoard,
  isPieceInBounds,
  isPiecePositionValid,
  removeCompleteRows,
  rotatePiece,
} from './board';
import styles from './TetrisContainer.scss';

type Props = {||};

type State = {|
  ticks: number,
  board: Board,
  score: number,
  gameSpeed: number,

  currentPiece: Piece,
  nextPiece: Piece,
|};

// Scores taken from https://tetris.com/play-tetris
const SCORING = {
  softDrop: (distance) => distance,
  hardDrop: (distance) => distance * 2,
  lineClear: (lines) => {
    if (lines === 0) return 0;
    if (lines === 1) return 100;
    if (lines === 2) return 300;
    if (lines === 3) return 500;
    return 800;
  },
};

// prettier-ignore
const PIECES = [
  // I-piece
  makePiece([
    '0010',
    '0010',
    '0010',
    '0010'
  ], 0),

  // J
  makePiece([
    '0010',
    '0010',
    '0010',
    '0110',
  ], 1),

  // L
  makePiece([
    '0100',
    '0100',
    '0100',
    '0110',
  ],2),

  // O
  makePiece([
    '11',
    '11',
  ], 3),

  // S
  makePiece([
    '000',
    '011',
    '110',
  ], 4),

  // T
  makePiece([
    '010',
    '111',
  ], 5),

  // Z
  makePiece([
    '000',
    '110',
    '011',
  ], 6),
];

const defaultBoard: Board = range(COLUMNS).map(() => range(ROWS).map(() => null));

export default class TetrisContainer extends PureComponent<Props, State> {
  state = {
    ticks: 0,
    gameSpeed: 10, // In ticks per move

    board: defaultBoard,
    score: 0,

    currentPiece: sample(PIECES),
    nextPiece: sample(PIECES),
  };

  componentDidMount() {
    Mousetrap.bind('left', (evt) => {
      evt.preventDefault();
      this.moveLeft();
    });

    Mousetrap.bind('right', (evt) => {
      evt.preventDefault();
      this.moveRight();
    });

    Mousetrap.bind('up', (evt) => {
      evt.preventDefault();
      this.rotatePiece();
    });

    Mousetrap.bind('down', (evt) => {
      evt.preventDefault();
      this.moveDown();
    });

    Mousetrap.bind('space', (evt) => {
      evt.preventDefault();
      this.hardDrop();
    });

    // Begin ticks
    setInterval(this.onTick, 50);
  }

  onTick = () => {
    this.setState(
      produce(this.state, (draft) => {
        draft.ticks += 1;

        // Move current piece down
        if (draft.ticks % this.state.gameSpeed === 0) {
          this.movePieceDown(draft);
        }
      }),
    );
  };

  moveLeft = () => {
    this.movePieceHorizontal(-1);
  };

  moveRight = () => {
    this.movePieceHorizontal(1);
  };

  rotatePiece = () => {
    const nextPiece = rotatePiece(this.state.currentPiece);

    // Don't allow the rotated piece to collide with existing blocks
    if (!isPiecePositionValid(this.state.board, nextPiece)) return;

    this.setState({
      currentPiece: nextPiece,
    });
  };

  moveDown = () => {
    this.setState(
      produce(this.state, (draft) => {
        this.movePieceDown(draft);
        draft.score += SCORING.softDrop(1);
      }),
    );
  };

  movePieceHorizontal = (dx: number) => {
    const { currentPiece } = this.state;

    const nextPiece = {
      ...currentPiece,
      x: currentPiece.x + dx,
    };

    if (isPieceInBounds(nextPiece) && isPiecePositionValid(this.state.board, nextPiece)) {
      this.setState({ currentPiece: nextPiece });
    }
  };

  movePieceDown = (draft: State) => {
    const nextPiece = {
      ...draft.currentPiece,
      y: draft.currentPiece.y + 1,
    };

    // If we can't move the piece down, then we stick the piece in place and move to
    // add a new piece
    if (!isPieceInBounds(nextPiece) || !isPiecePositionValid(draft.board, nextPiece)) {
      // Add piece to board - this.state.currentPiece is used so we use the old y pos
      const boardWithPiece = placePieceOnBoard(draft.board, draft.currentPiece);

      // Check for row removal
      const { newBoard, rowsCleared } = removeCompleteRows(boardWithPiece);
      draft.board = newBoard;
      draft.score += SCORING.lineClear(rowsCleared);

      // Create next piece
      draft.currentPiece = draft.nextPiece;
      draft.nextPiece = sample(PIECES);

      return true;
    }

    draft.currentPiece = nextPiece;
    return false;
  };

  hardDrop = () => {
    this.setState(
      produce(this.state, (draft) => {
        let distance = 0;
        while (!this.movePieceDown(draft)) {
          distance += 1;
        }

        draft.score += SCORING.hardDrop(distance);
      }),
    );
  };

  render() {
    const { score, board, currentPiece, nextPiece } = this.state;

    const boardWithPiece = placePieceOnBoard(board, currentPiece);
    const lessons = boardToTimetableArrangement(boardWithPiece);

    return (
      <div className={classnames('page-container verticalMode', styles.container)}>
        <div>
          <Timetable lessons={lessons} isVerticalOrientation />
        </div>
        <div>
          <p>Score: {score}</p>
        </div>
      </div>
    );
  }
}
