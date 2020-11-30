import { get, last, pick, set, takeRight } from 'lodash';

import { REDO, UNDO } from 'actions/constants';
import { UndoHistoryState } from 'types/reducers';
import { Actions } from 'types/actions';

export type UndoHistoryConfig = {
  limit?: number;
  actionsToWatch: string[];
  whitelist: string[];
};

// Update undo history using the action and app states
// Basically a reducer but not really, as it needs to know the previous state.
// Passing state in even though state === presentAppState[config.reducerName] as the "reducer"
// doesn't need to know that.
export function computeUndoStacks<T extends { undoHistory: UndoHistoryState<T> }>(
  state: UndoHistoryState<T> = {
    past: [],
    present: undefined, // Don't pretend to know the present
    future: [],
  },
  action: Actions,
  previousAppState: Partial<T>,
  presentAppState: Partial<T>,
  config: UndoHistoryConfig,
): UndoHistoryState<T> {
  const { past, present, future } = state;

  // If action is undo/redoable, store state
  if (config.actionsToWatch.includes(action.type)) {
    // Append actual present to past, and drop history past config.limit
    // Limit only enforced here since undo/redo only shift the history around without adding new history
    const appendedPast = [...past, pick(previousAppState, config.whitelist)];
    const newPast = 'limit' in config ? takeRight(appendedPast, config.limit) : appendedPast;

    return {
      past: newPast,
      present: pick(presentAppState, config.whitelist),
      future: [],
    };
  }

  switch (action.type) {
    case UNDO: {
      // Abort if no past, or present is unknown
      if (past.length === 0 || !present) return state;
      const previous = last(past);
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    }
    case REDO: {
      // Abort if no future, or present is unknown
      if (future.length === 0 || !present) return state;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    }
    default: {
      return state;
    }
  }
}

// Copy all keyPaths in present into a new copy of state
export function mergePresent<T extends Record<string, unknown>>(
  state: T,
  present: Record<string, unknown>,
  keyPaths: string[],
): T {
  const newState = { ...state };
  keyPaths.forEach((path) => {
    const presentValue = get(present, path);
    if (presentValue) set(newState, path, presentValue);
  });
  return newState;
}

// Given a config object, returns function which compute new state after
// undoing/redoing/storing present as required by action.
export default function createUndoReducer<T extends { undoHistory: UndoHistoryState<T> }>(
  config: UndoHistoryConfig,
) {
  return (previousState: T, presentState: T, action: Actions) => {
    // Calculate un/redone history
    const undoHistoryState = presentState.undoHistory;
    const updatedHistory = computeUndoStacks(
      undoHistoryState,
      action,
      previousState,
      presentState,
      config,
    );
    const updatedState = { ...presentState, undoHistory: updatedHistory };

    // Applies undo and redo actions on overall app state
    // Applies updatedHistory.present to state if action.type === {UNDO,REDO}
    // Assumes updatedHistory.present is the final present state
    if ((action.type === UNDO || action.type === REDO) && updatedHistory.present) {
      return mergePresent(updatedState, updatedHistory.present, config.whitelist);
    }
    return updatedState;
  };
}
