// @flow
import type { FSA } from 'types/redux';

export const UNDO = 'UNDO';
export function undo(): FSA {
  return { type: UNDO, payload: {} };
}

export const REDO = 'REDO';
export function redo(): FSA {
  return { type: REDO, payload: {} };
}

// Remove one history instance from past.
// Like calling `undo()` without actually reverting to a past state
export const POP_UNDO_HISTORY = 'POP_UNDO_HISTORY';
export function popUndoHistory(): FSA {
  return { type: POP_UNDO_HISTORY, payload: {} };
}
