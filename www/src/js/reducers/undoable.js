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

type UndoableState<T> = {
  past: Array<T>,
  present: T,
  future: Array<T>,
};

export default function undoable<T>(
  reducer: (T, Object) => T,
): (UndoableState<T>, Object) => UndoableState<T> {
  // Call the reducer with empty action to populate the initial state
  const initialState: UndoableState<T> = {
    past: [],
    // $FlowFixMe reducers accept undefined and have default state
    present: reducer(undefined, {}),
    future: [],
  };

  // Return a reducer that handles undo and redo
  return (state = initialState, action: Object) => {
    const { past, present, future } = state;

    switch (action.type) {
      case UNDO: {
        if (past.length === 0) return state;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        return {
          past: newPast,
          present: previous,
          future: [present, ...future],
        };
      }
      case REDO: {
        if (future.length === 0) return state;
        const next = future[0];
        const newFuture = future.slice(1);
        return {
          past: [...past, present],
          present: next,
          future: newFuture,
        };
      }
      default: {
        // Delegate handling the action to the passed reducer
        const newPresent = reducer(present, action);
        if (present === newPresent) {
          return state;
        }
        return {
          past: [...past, present],
          present: newPresent,
          future: [],
        };
      }
    }
  };
}
