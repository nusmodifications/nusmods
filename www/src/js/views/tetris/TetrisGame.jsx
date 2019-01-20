// @flow

import React, { PureComponent } from 'react';
import Mousetrap from 'mousetrap';
import { noop, range, shuffle } from 'lodash';
import classnames from 'classnames';
import produce from 'immer';

import Timetable from 'views/timetable/Timetable';
import TimetableDay from 'views/timetable/TimetableDay';
import instructionImage from 'img/instructions.png';

import type { Board, Piece } from './board';
import {
  boardToTimetableArrangement,
  ROWS,
  COLUMNS,
  INITIAL_ROW_INDEX,
  PIECES,
  isPieceInBounds,
  isPiecePositionValid,
  pieceToTimetableDayArrangement,
  placePieceOnBoard,
  removeCompleteRows,
  rotatePieceLeft,
  rotatePieceRight,
} from './board';
import ScrollingNumber from './ScrollingNumber';
import TetrisLogo from './TetrisLogo';
import styles from './TetrisGame.scss';

type GameStatus = 'playing' | 'paused' | 'not started' | 'game over';
const PLAYING: GameStatus = 'playing';
const PAUSED: GameStatus = 'paused';
const NOT_STARTED: GameStatus = 'not started';
const GAME_OVER: GameStatus = 'game over';

// Game speed in ticks per move
const DEFAULT_SPEED = 10; // 50ms * 10 = 0.5 seconds
const MAX_SPEED = 4; // 50ms * 4 = 0.2 seconds
const GAME_TICK_INTERVAL = 50; // In milliseconds

type Props = {|
  +resetGame: () => void,
|};

type State = {|
  board: Board,
  score: number,
  linesCleared: number,

  status: GameStatus,

  currentPiece: Piece,
  holdPiece: ?Piece,
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

const displayNone = { display: 'none' };

const defaultBoard: Board = range(COLUMNS).map(() => range(ROWS).map(() => null));

export default class TetrisGame extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    const [currentPiece, ...nextPieces] = shuffle(PIECES);

    this.state = {
      status: NOT_STARTED,

      board: defaultBoard,
      score: 0,
      linesCleared: 0,

      holdPiece: null,
      currentPiece,
      nextPieces,
    };
  }

  componentDidMount() {
    Mousetrap.bind('space', (evt) => {
      evt.preventDefault();
      this.startGame();
    });
  }

  componentWillUnmount() {
    Mousetrap.reset();
  }

  onTick = () => {
    if (!this.isPlaying()) return;

    this.ticks += 1;

    this.setState(
      produce(this.state, (draft) => {
        // Move current piece down
        if (this.ticks % this.gameSpeed() === 0) {
          this.movePieceDown(draft);
        }
      }),
    );
  };

  ticks = 0;
  keybindings = [
    [['left', 'a'], () => this.moveLeft()],
    [['right', 'd'], () => this.moveRight()],
    [['down', 's'], () => this.moveDown()],

    ['q', () => this.rotatePieceLeft()],
    [['up', 'e'], () => this.rotatePieceRight()],

    [['space', 'w'], () => this.hardDrop()],
    [['f', 'h'], () => this.holdPiece()],
    [['p', 'esc'], () => this.togglePause()],
  ];

  gameSpeed() {
    // Increase game speed every eight lines cleared until it reaches max speed
    return Math.max(DEFAULT_SPEED - Math.floor(this.state.linesCleared / 8), MAX_SPEED);
  }

  startGame = () => {
    // Only allow game initialization when the game isn;t already running
    if (this.state.status !== NOT_STARTED) return;

    // We are binding these on game start because <KeyboardShortcuts> is mounted after us,
    // so it will override some of these shortcuts
    // Try to clear any existing bindings before binding our own
    Mousetrap.reset();

    this.keybindings.forEach(([key, binding]) => {
      Mousetrap.bind(key, (evt) => {
        evt.preventDefault();
        binding();
      });
    });

    // Start game ticking
    setInterval(this.onTick, GAME_TICK_INTERVAL);

    this.setState({ status: PLAYING });
  };

  isPlaying() {
    return this.state.status === PLAYING;
  }

  moveLeft = () => {
    if (!this.isPlaying()) return;
    this.movePieceHorizontal(-1);
  };

  moveRight = () => {
    if (!this.isPlaying()) return;
    this.movePieceHorizontal(1);
  };

  rotatePieceRight = () => {
    if (!this.isPlaying()) return;

    const nextPiece = rotatePieceRight(this.state.currentPiece);

    // Don't allow the rotated piece to collide with existing blocks
    if (isPiecePositionValid(this.state.board, nextPiece)) {
      this.setState({
        currentPiece: nextPiece,
      });
    }
  };

  rotatePieceLeft = () => {
    const nextPiece = rotatePieceLeft(this.state.currentPiece);

    // Don't allow the rotated piece to collide with existing blocks
    if (isPiecePositionValid(this.state.board, nextPiece)) {
      this.setState({
        currentPiece: nextPiece,
      });
    }
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

    // If the next position is valid then we simply move the piece down one
    if (isPieceInBounds(nextPiece) && isPiecePositionValid(draft.board, nextPiece)) {
      draft.currentPiece = nextPiece;
      return true;
    }

    // Otherwise we stick the piece in place and move to add a new piece
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

  holdPiece = () => {
    if (!this.isPlaying()) return;

    this.setState(
      produce(this.state, (draft) => {
        const holdPiece = draft.holdPiece;
        draft.holdPiece = draft.nextPieces.shift();

        if (holdPiece) {
          draft.nextPieces.unshift(holdPiece);
        } else if (draft.nextPieces.length === 0) {
          draft.nextPieces = shuffle(PIECES);
        }
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
              <p>
                Score: <strong>{this.state.score}</strong>
              </p>
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
              <TetrisLogo />

              <h3>How to Play</h3>
              <div>
                <img src={instructionImage} alt="" />
              </div>

              <h3>Scores</h3>
              <table className={classnames(styles.scoreTable, 'table table-sm table-borderless ')}>
                <tbody>
                  <tr>
                    <th>Soft Drop</th>
                    <td>1 &times; distance</td>
                  </tr>
                  <tr>
                    <th>Hard Drop</th>
                    <td>2 &times; distance</td>
                  </tr>
                  <tr>
                    <th>1 row clear</th>
                    <td>100</td>
                  </tr>
                  <tr>
                    <th>2 rows clear</th>
                    <td>300</td>
                  </tr>
                  <tr>
                    <th>3 rows clear</th>
                    <td>500</td>
                  </tr>
                  <tr>
                    <th>4 rows clear</th>
                    <td>800</td>
                  </tr>
                </tbody>
              </table>

              <button className="btn btn-lg btn-primary" type="button" onClick={this.startGame}>
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
                onClick={() => this.props.resetGame()}
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
    const { score, linesCleared, board, currentPiece, nextPieces, holdPiece } = this.state;
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

          <section>
            <h3>Hold</h3>
            {holdPiece ? (
              <TimetableDay
                day=""
                verticalMode
                dayLessonRows={pieceToTimetableDayArrangement(holdPiece.tiles)}
                showTitle={false}
                isScrolledHorizontally={false}
                startingIndex={INITIAL_ROW_INDEX}
                endingIndex={INITIAL_ROW_INDEX + holdPiece.tiles[0].length}
                onModifyCell={noop}
                isCurrentDay={false}
                currentTimeIndicatorStyle={displayNone}
                hoverLesson={null}
                onCellHover={null}
              />
            ) : (
              <p className={styles.holdText}>
                Press <kbd>F</kbd> or <kbd>H</kbd> to hold the next piece
              </p>
            )}
          </section>
        </div>
      </div>
    );
  }
}
