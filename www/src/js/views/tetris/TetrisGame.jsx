// @flow

import React, { PureComponent } from 'react';
import Mousetrap from 'mousetrap';
import { noop, shuffle } from 'lodash';
import classnames from 'classnames';
import produce from 'immer';

import Timetable from 'views/timetable/Timetable';
import TimetableDay from 'views/timetable/TimetableDay';

import type { Board, Piece } from './board';
import {
  boardToTimetableArrangement,
  defaultBoard,
  INITIAL_ROW_INDEX,
  isPieceInBounds,
  isPiecePositionValid,
  PIECES,
  pieceToTimetableDayArrangement,
  placePieceOnBoard,
  removeCompleteRows,
  rotatePieceLeft,
  rotatePieceRight,
} from './board';
import GameStart from './overlays/GameStart';
import GamePaused from './overlays/GamePaused';
import GameOver from './overlays/GameOver';
import ScrollingNumber from './ScrollingNumber';
import styles from './TetrisGame.scss';

// Game status enum
type GameStatus = 'playing' | 'paused' | 'not started' | 'game over';
const PLAYING: GameStatus = 'playing';
const PAUSED: GameStatus = 'paused';
const NOT_STARTED: GameStatus = 'not started';
const GAME_OVER: GameStatus = 'game over';

// Piece rotation enum
type Rotation = 'left' | 'right';
const LEFT: Rotation = 'left';
const RIGHT: Rotation = 'right';

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

const DISPLAY_NONE = { display: 'none' };

export default class TetrisGame extends PureComponent<Props, State> {
  intervalId: IntervalID;

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
    clearInterval(this.intervalId);
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

  // Ticks are not stored as state because it only affects game logic
  // and not rendering
  ticks = 0;
  keybindings = [
    [['left', 'a'], () => this.movePieceHorizontal(-1)],
    [['right', 'd'], () => this.movePieceHorizontal(1)],
    [['down', 's'], () => this.moveDown()],

    ['q', () => this.rotatePiece(LEFT)],
    [['up', 'e'], () => this.rotatePiece(RIGHT)],

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

    // We are binding these only on game start because <KeyboardShortcuts> is mounted
    // after us, so it will override some of these shortcuts.

    // Try to clear any existing bindings before binding our own
    Mousetrap.reset();

    this.keybindings.forEach(([key, binding]) => {
      Mousetrap.bind(key, (evt) => {
        evt.preventDefault();
        binding();
      });
    });

    // Start game ticking
    this.intervalId = setInterval(this.onTick, GAME_TICK_INTERVAL);

    this.setState({ status: PLAYING });
  };

  isPlaying() {
    return this.state.status === PLAYING;
  }

  rotatePiece = (rotation: Rotation) => {
    if (!this.isPlaying()) return;

    const { currentPiece, board } = this.state;
    const nextPiece =
      rotation === LEFT ? rotatePieceLeft(currentPiece) : rotatePieceRight(currentPiece);

    // Don't allow the rotated piece to collide with existing blocks
    if (isPiecePositionValid(board, nextPiece)) {
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

    const { currentPiece, board } = this.state;

    const nextPiece = {
      ...currentPiece,
      x: currentPiece.x + dx,
    };

    if (isPieceInBounds(nextPiece) && isPiecePositionValid(board, nextPiece)) {
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

  /**
   * Drops the piece immediately to its final position
   */
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

  togglePause = () => {
    const { status } = this.state;

    if (status === PAUSED) {
      this.setState({ status: PLAYING });
    } else if (status === PLAYING) {
      this.setState({ status: PAUSED });
    }
  };

  renderOverlay() {
    switch (this.state.status) {
      case PLAYING:
        return null;

      case PAUSED:
        return <GamePaused score={this.state.score} resumeGame={this.togglePause} />;

      case NOT_STARTED:
        return <GameStart startGame={this.startGame} />;

      case GAME_OVER:
        return <GameOver score={this.state.score} resetGame={this.props.resetGame} />;

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
              currentTimeIndicatorStyle={DISPLAY_NONE}
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
                currentTimeIndicatorStyle={DISPLAY_NONE}
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
