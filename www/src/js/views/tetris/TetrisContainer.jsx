// @flow

import React, { PureComponent } from 'react';
import Mousetrap from 'mousetrap';
import { range, shuffle, noop } from 'lodash';
import classnames from 'classnames';
import produce from 'immer';

import Timetable from 'views/timetable/Timetable';
import TimetableDay from 'views/timetable/TimetableDay';

import type { Board, Piece } from './board';
import {
  ROWS,
  COLUMNS,
  INITIAL_ROW_INDEX,
  makePiece,
  boardToTimetableArrangement,
  placePieceOnBoard,
  isPieceInBounds,
  isPiecePositionValid,
  removeCompleteRows,
  rotatePiece,
  pieceToTimetableDayArrangement,
} from './board';
import styles from './TetrisContainer.scss';
import ScrollingNumber from './ScrollingNumber';

type GameStatus = 'playing' | 'paused' | 'not started' | 'game over';
const PLAYING: GameStatus = 'playing';
const PAUSED: GameStatus = 'paused';
const NOT_STARTED: GameStatus = 'not started';
const GAME_OVER: GameStatus = 'game over';

type Props = {||};

type State = {|
  board: Board,
  score: number,
  linesCleared: number,

  status: GameStatus,

  currentPiece: Piece,
  nextPieces: Piece[],
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
    '0010',
  ], 0),

  // J
  makePiece([
    '0010',
    '0010',
    '0110',
  ], 1),

  // L
  makePiece([
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

const displayNone = { display: 'none' };

const defaultBoard: Board = range(COLUMNS).map(() => range(ROWS).map(() => null));

export default class TetrisContainer extends PureComponent<Props, State> {
  ticks: number;
  gameSpeed: number; // In ticks per move

  constructor(props: Props) {
    super(props);

    const [currentPiece, ...nextPieces] = shuffle(PIECES);

    this.state = {
      status: NOT_STARTED,

      board: defaultBoard,
      score: 0,
      linesCleared: 0,

      currentPiece,
      nextPieces,
    };
  }

  componentDidMount() {
    this.keybindings.forEach(([key, binding]) => {
      Mousetrap.bind(key, (evt) => {
        evt.preventDefault();
        binding();
      });
    });

    // Begin ticks
    setInterval(this.onTick, 50);
  }

  componentWillUnmount() {
    this.keybindings.forEach(([key]) => {
      Mousetrap.unbind(key);
    });
  }

  onTick = () => {
    if (!this.isPlaying()) return;

    this.ticks += 1;

    this.setState(
      produce(this.state, (draft) => {
        // Move current piece down
        if (this.ticks % this.gameSpeed === 0) {
          this.movePieceDown(draft);
        }
      }),
    );
  };

  keybindings = [
    ['left', () => this.moveLeft()],
    ['right', () => this.moveRight()],
    ['down', () => this.moveDown()],
    ['up', () => this.rotatePiece()],
    ['space', () => this.hardDrop()],
    [['p', 'esc'], () => this.togglePause()],
  ];

  isPlaying() {
    return this.state.status === PLAYING;
  }

  startGame = () => {
    // Reset game state
    this.ticks = 0;
    this.gameSpeed = 10;

    const [currentPiece, ...nextPieces] = shuffle(PIECES);

    this.setState({
      status: PLAYING,
      score: 0,
      linesCleared: 0,

      board: defaultBoard,
      currentPiece,
      nextPieces,
    });
  };

  moveLeft = () => {
    if (!this.isPlaying()) return;
    this.movePieceHorizontal(-1);
  };

  moveRight = () => {
    if (!this.isPlaying()) return;
    this.movePieceHorizontal(1);
  };

  rotatePiece = () => {
    if (!this.isPlaying()) return;

    const nextPiece = rotatePiece(this.state.currentPiece);

    // Don't allow the rotated piece to collide with existing blocks
    if (!isPiecePositionValid(this.state.board, nextPiece)) return;

    this.setState({
      currentPiece: nextPiece,
    });
  };

  moveDown = () => {
    if (!this.isPlaying()) return;

    this.setState(
      produce(this.state, (draft) => {
        this.movePieceDown(draft);
        draft.score += SCORING.softDrop(1);
      }),
    );
  };

  movePieceHorizontal = (dx: number) => {
    if (!this.isPlaying()) return;

    const { currentPiece } = this.state;

    const nextPiece = {
      ...currentPiece,
      x: currentPiece.x + dx,
    };

    if (isPieceInBounds(nextPiece) && isPiecePositionValid(this.state.board, nextPiece)) {
      this.setState({ currentPiece: nextPiece });
    }
  };

  /**
   * Moves the current piece down by 1 unit, returning true if it is possible and
   * false otherwise, because the piece has collided with the bottom or other blocks
   */
  movePieceDown = (draft: State) => {
    if (!this.isPlaying()) return false;

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
      draft.linesCleared += rowsCleared;

      // If a piece has reached the top row, trigger game over
      if (draft.board.some((column) => column[0])) {
        draft.status = GAME_OVER;
      }

      // Create next piece
      draft.currentPiece = draft.nextPieces.shift();
      if (draft.nextPieces.length === 0) {
        draft.nextPieces = shuffle(PIECES);
      }

      return false;
    }

    draft.currentPiece = nextPiece;
    return true;
  };

  hardDrop = () => {
    if (!this.isPlaying()) return;

    this.setState(
      produce(this.state, (draft) => {
        let distance = 0;
        while (this.movePieceDown(draft)) {
          distance += 1;
        }

        draft.score += SCORING.hardDrop(distance);
      }),
    );
  };

  togglePause() {
    const { status } = this.state;
    if (status === PAUSED) {
      this.setState({ status: PLAYING });
    } else if (status === PLAYING) {
      this.setState({ status: PAUSED });
    }
  }

  renderOverlay() {
    switch (this.state.status) {
      case PLAYING:
        return null;

      case PAUSED:
        return (
          <div className={styles.overlay}>
            <div className={styles.overlayContent}>
              <h2>Game Paused</h2>
              <p>Score: {this.state.score}</p>
              <button
                className="btn btn-lg btn-primary"
                type="button"
                onClick={() => this.setState({ status: PLAYING })}
              >
                Resume
              </button>
            </div>
          </div>
        );

      case NOT_STARTED:
        return (
          <div className={styles.overlay}>
            <div className={styles.overlayContent}>
              <h1>NUSMotris</h1>
              <button
                className="btn btn-lg btn-primary"
                type="button"
                onClick={() => this.startGame()}
              >
                Start
              </button>
            </div>
          </div>
        );

      case GAME_OVER:
        return (
          <div className={styles.overlay}>
            <div className={styles.overlayContent}>
              <h2>Game Over</h2>
              <p>
                Final Score: <strong>{this.state.score}</strong>
              </p>
              <button
                className="btn btn-lg btn-primary"
                type="button"
                onClick={() => this.setState({ status: NOT_STARTED })}
              >
                Continue
              </button>
            </div>
          </div>
        );

      default:
        throw new Error(`Unknown game status ${this.state.status}`);
    }
  }

  render() {
    const { score, linesCleared, board, currentPiece, nextPieces } = this.state;
    const nextPiece = nextPieces[0];

    const boardWithPiece = placePieceOnBoard(board, currentPiece);
    const lessons = boardToTimetableArrangement(boardWithPiece);

    return (
      <div className={classnames('page-container verticalMode', styles.container)}>
        <div className={styles.game}>
          {this.renderOverlay()}
          <Timetable lessons={lessons} isVerticalOrientation />
        </div>
        <div className={styles.sidebar}>
          <section>
            <h3>Score</h3>
            <ScrollingNumber tagName="strong" className={styles.score}>
              {score}
            </ScrollingNumber>
          </section>

          <section>
            <h3>Lines Cleared</h3>
            <ScrollingNumber tagName="strong" className={styles.score}>
              {linesCleared}
            </ScrollingNumber>
          </section>

          <section>
            <h3>Next piece</h3>
            <TimetableDay
              day=""
              verticalMode
              dayLessonRows={pieceToTimetableDayArrangement(nextPiece.tiles)}
              showTitle={false}
              isScrolledHorizontally={false}
              startingIndex={INITIAL_ROW_INDEX}
              endingIndex={INITIAL_ROW_INDEX + nextPiece.tiles[0].length}
              onModifyCell={noop}
              isCurrentDay={false}
              currentTimeIndicatorStyle={displayNone}
              hoverLesson={null}
              onCellHover={null}
            />
          </section>
        </div>
      </div>
    );
  }
}
