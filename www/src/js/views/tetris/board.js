// @flow
import { range, zip } from 'lodash';
import produce from 'immer';

import type { ColorIndex } from 'types/reducers';
import { DaysOfWeek } from 'types/modules';
import type { ColoredLesson } from 'types/modules';
import { convertIndexToTime } from 'utils/timify';
import type { TimetableArrangement } from 'types/timetables';

export const ROWS = 20;
export const COLUMNS = 9;

/* eslint-disable no-continue, consistent-return, no-loop-func */

// The first timetable row index to be used
const INITIAL_ROW_INDEX = 16; // 8am

export type Square = {|
  +color: ColorIndex,
|};

export type Board = Array<Array<?Square>>;

export type Piece = {|
  x: number,
  y: number,
  tiles: Board,
|};

export function makePiece(shape: string[], color: ColorIndex, y: number = 0): Piece {
  return {
    y,
    x: 0,
    tiles: shape.map((row) => row.split('').map((tile) => (tile === '1' ? { color } : null))),
  };
}
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

export function rotatePiece(piece: Piece): Piece {
  return produce(piece, (draft: Piece) => {
    // Rotate the piece using zip and reverse
    // $FlowFixMe - lodash zip's typing isn't correct
    draft.tiles = zip(...piece.tiles).reverse();

    // Rotating the piece may cause it to go out of bounds. If that
    // happens we try to push it back in bounds
    let dx = 0;
    let dy = 0;

    iteratePiece(draft, (tile, col, row) => {
      if (row < 0) dy = Math.max(dy, -row);
      if (col < 0) dx = Math.max(dx, -col);
      if (row >= ROWS) dy = Math.min(dy, ROWS - row - 1);
      if (col >= COLUMNS) dx = Math.min(dx, COLUMNS - col - 1);
    });

    draft.x += dx;
    draft.y += dy;
  });
}

export function placePieceOnBoard(board: Board, piece: Piece): Board {
  return produce(board, (draft) => {
    iteratePiece(piece, (tile, col, row) => {
      draft[col][row] = tile;
    });
  });
}

export function isPieceInBounds(piece: Piece) {
  let isValid = true;

  iteratePiece(piece, (tile, col, row) => {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLUMNS) {
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
