// @flow
import { findLastIndex, min, range, zip } from 'lodash';
import produce from 'immer';

import type { ColorIndex } from 'types/reducers';
import type { ColoredLesson } from 'types/modules';
import { DaysOfWeek } from 'types/modules';
import { convertIndexToTime } from 'utils/timify';
import type { TimetableArrangement, TimetableDayArrangement } from 'types/timetables';

export const ROWS = 20;
export const COLUMNS = 9;

/**
 * Contains most of the gameplay logic
 */

/* eslint-disable no-continue, consistent-return, no-loop-func */

// The first timetable row index to be used
export const INITIAL_ROW_INDEX = 16; // 8am

export type Square = {|
  color: ColorIndex,
|};

// A 2D array of squares representing the Tetris board in column major order.
// The top right corner is (0, 0)
export type Board = Array<Array<?Square>>;

export type Piece = {|
  x: number,
  y: number,
  tiles: Board,
|};

export const defaultBoard: Board = range(COLUMNS).map(() => range(ROWS).map(() => null));

export function originalPosition(tiles: Board) {
  return {
    // Center the piece
    x: Math.floor(COLUMNS / 2 - tiles.length / 2),
    // Find the number of tiles needed to move the entire piece above the start line
    y: min(tiles.map((column) => -findLastIndex(column, (tile) => tile))) - 1,
  };
}

export function makePiece(shape: string[], color: ColorIndex): Piece {
  // Map 1s to filled squares and 0s to to empty squares (null)
  const rows = shape.map((row) => row.split('').map((tile) => (tile === '1' ? { color } : null)));

  // $FlowFixMe lodash has incorrect zip libdefs
  const tiles: Board = zip(...rows);

  return {
    tiles,
    ...originalPosition(tiles),
  };
}

// prettier-ignore
export const PIECES = [
  // I-piece
  makePiece([
    "0010",
    "0010",
    "0010",
    "0010"
  ], 0),

  // J
  makePiece([
    "001",
    "001",
    "011"
  ], 1),

  // L
  makePiece([
    "100",
    "100",
    "110"
  ], 2),

  // O
  makePiece([
    "11",
    "11"
  ], 3),

  // S
  makePiece([
    "000",
    "011",
    "110"
  ], 4),

  // T
  makePiece([
    "000",
    "010",
    "111"
  ], 5),

  // Z
  makePiece([
    "000",
    "110",
    "011"
  ], 6)
];

/**
 * Iterate over all tiles on the board. Return false in the iterator to
 * break the loop early.
 */
function iterateBoard(
  board: Board,
  iterator: (tile: Square, col: number, row: number) => ?boolean,
) {
  let continueIterating = true;

  for (let col = 0; col < board.length; col++) {
    const column = board[col];

    for (let row = 0; row < column.length; row++) {
      const tile = column[row];
      if (!tile) continue;
      if (iterator(tile, col, row) === false) {
        continueIterating = false;
        break;
      }
    }

    if (!continueIterating) break;
  }
}

function iteratePiece(
  piece: Piece,
  iterator: (tile: Square, col: number, row: number) => ?boolean,
) {
  return iterateBoard(piece.tiles, (tile, col, row) =>
    iterator(tile, col + piece.x, row + piece.y),
  );
}

/**
 * Rotating the piece may cause it to go out of bounds. If that
 * happens we try to push it back in bounds
 *
 * @param draft - assumed to be the draft state from immer's produce
 */
function pushPieceInBounds(draft: Piece) {
  let dx = 0;
  let dy = 0;

  iteratePiece(draft, (tile, col, row) => {
    if (col < 0) dx = Math.max(dx, -col);
    if (row >= ROWS) dy = Math.min(dy, ROWS - row - 1);
    if (col >= COLUMNS) dx = Math.min(dx, COLUMNS - col - 1);
  });

  draft.x += dx;
  draft.y += dy;
}

export function rotatePieceRight(piece: Piece): Piece {
  if (piece.tiles.length === 0) return piece;

  return produce(piece, (draft) => {
    const newTiles = [];
    // When turning rightwards, the last row becomes the first column
    for (let row = draft.tiles[0].length - 1; row >= 0; row--) {
      newTiles.push(draft.tiles.map((column) => column[row]));
    }
    draft.tiles = newTiles;

    pushPieceInBounds(draft);
  });
}

export function rotatePieceLeft(piece: Piece): Piece {
  if (piece.tiles.length === 0) return piece;

  return produce(piece, (draft) => {
    const newTiles = [];
    // When turning leftwards the first row becomes the first column reversed
    for (let row = 0; row < draft.tiles[0].length; row++) {
      newTiles.push(draft.tiles.map((column) => column[row]).reverse());
    }
    draft.tiles = newTiles;

    pushPieceInBounds(draft);
  });
}

export function placePieceOnBoard(board: Board, ...pieces: Piece[]): Board {
  return produce(board, (draft) => {
    pieces.forEach((piece) => {
      iteratePiece(piece, (tile, col, row) => {
        draft[col][row] = tile;
      });
    });
  });
}

export function isPieceInBounds(piece: Piece) {
  let isValid = true;

  iteratePiece(piece, (tile, col, row) => {
    // row < 0 is not checked because pieces begin above the board, so those are
    // valid locations
    if (row >= ROWS || col < 0 || col >= COLUMNS) {
      isValid = false;
      return false;
    }
  });

  return isValid;
}

export function isPiecePositionValid(board: Board, piece: Piece) {
  let isValid = true;

  // Check for intersection with existing blocks on the board
  iteratePiece(piece, (tile, col, row) => {
    if (board[col][row]) {
      isValid = false;
      return false;
    }
  });

  return isValid;
}

export function dropPiece(board: Board, piece: Piece) {
  let lastPiece = piece;
  let nextPiece = piece;

  do {
    lastPiece = nextPiece;
    nextPiece = {
      ...lastPiece,
      y: lastPiece.y + 1,
    };
  } while (isPiecePositionValid(board, nextPiece) && isPieceInBounds(nextPiece));

  return lastPiece;
}

export function recolorPiece(piece: Piece, newColor: ColorIndex) {
  return produce(piece, (draft) => {
    iteratePiece(draft, (square) => {
      square.color = newColor; // eslint-disable-line no-param-reassign
    });
  });
}

export function removeCompleteRows(board: Board) {
  let rowsCleared = 0;

  const newBoard = produce(board, (draft: Board) => {
    // TODO: Optimize based on where the piece has landed
    let row = ROWS - 1;
    while (row >= 0) {
      if (draft.every((column) => column[row])) {
        draft.forEach((column) => {
          column.splice(row, 1);
          column.unshift(null);
        });

        rowsCleared += 1;
      } else {
        row -= 1;
      }
    }
  });

  return { newBoard, rowsCleared };
}

function createLessonSquare(color: ColorIndex, row: number): ColoredLesson {
  return {
    // Fillers
    // TODO: Use existing modules?
    ClassNo: '',
    DayText: '',
    WeekText: 'Every Week',
    LessonType: '',
    ModuleCode: '',
    ModuleTitle: '',
    Venue: '',

    // Variable props
    StartTime: convertIndexToTime(INITIAL_ROW_INDEX + row),
    EndTime: convertIndexToTime(INITIAL_ROW_INDEX + row + 1),
    colorIndex: color,
  };
}

const BORDER_COLOR = 10;
export function boardToTimetableArrangement(board: Board): TimetableArrangement {
  // Assume column count is divisible by 3
  const days = DaysOfWeek.slice(0, 5);
  const timetable = {};

  days.forEach((day) => {
    if (day === DaysOfWeek[0] || day === DaysOfWeek[4]) {
      // Monday and Friday are filled with a single column of mock lessons acting as a border
      timetable[day] = [range(ROWS + 2).map((i) => createLessonSquare(BORDER_COLOR, i))];
    } else {
      timetable[day] = range(3).map(() => [
        createLessonSquare(BORDER_COLOR, 0),
        createLessonSquare(BORDER_COLOR, ROWS + 1),
      ]);
    }
  });

  iterateBoard(board, (tile, col, row) => {
    const day = DaysOfWeek[Math.floor(col / 3) + 1];
    const dayColumn = col % 3;
    timetable[day][dayColumn].push(createLessonSquare(tile.color, row + 1));
  });

  return timetable;
}

export function pieceToTimetableDayArrangement(board: Board): TimetableDayArrangement {
  return board.map((column) =>
    column
      .map((tile, index) => (!tile ? null : createLessonSquare(tile.color, index)))
      .filter(Boolean),
  );
}
