// @flow
import type { FSA } from 'types/redux';

import { pick, takeRight, set, get } from 'lodash';
import { UNDO, REDO, POP_UNDO_HISTORY } from 'actions/undoHistory';
import { difference, redoDifference } from 'utils/difference';

export type UndoHistoryConfig = {
  reducerName: string,
  limit?: number,
  actionsToWatch: string[],
  keyPathsToPersist: string[],
};

export type UndoHistoryState = {
  past: Object[],
  present: ?Object,
  future: Object[],
};

// Call the reducer with empty action to populate the initial state
const initialState: UndoHistoryState = {
  past: [],
  present: undefined, // Don't pretend to know the present
  future: [],
};

// Update undo history using the action and app states
// Basically a reducer but not really, as it needs to know the previous state.
// Passing state in even though state === presentAppState[config.reducerName] as the "reducer"
// doesn't need to know that.
export function computeUndoStacks<T: Object>(
  state: UndoHistoryState = initialState,
  action: FSA,
  previousAppState: T,
  presentAppState: T,
  config: UndoHistoryConfig,
): UndoHistoryState {
  const { past, present, future } = state;

  // If action is undo/redoable, store state
  if (config.actionsToWatch.includes(action.type)) {
    // Append present to past, and drop history past config.limit
    // Limit only enforced here since undo/redo only shift the history around without adding new history
    const appendedPast = [...past, present || pick(previousAppState, config.keyPathsToPersist)];
    const newPast = 'limit' in config ? takeRight(appendedPast, config.limit) : appendedPast;

    return {
      past: newPast,
      present: pick(presentAppState, config.keyPathsToPersist),
      future: [],
    };
  }

  switch (action.type) {
    case UNDO: {
      // Abort if no past, or present is unknown
      if (past.length === 0 || !present) return state;
      const previous = past[past.length - 1];
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
    case POP_UNDO_HISTORY: {
      // Abort if no past, or present is unknown
      if (past.length === 0 || !present) return state;

      // Simple pop if only 1 past or propagate diff disabled
      const truncatedPast = past.slice(0, past.length - 1);
      if (past.length === 1 || !action.payload.propagateDiff)
        return { ...state, past: truncatedPast };

      const previous = past[past.length - 1];
      const diff = difference(previous, present);
      const newPast = truncatedPast.map((pastState) => redoDifference(pastState, diff));
      return { ...state, past: newPast };
    }
    default: {
      return state;
    }
  }
}

// Copy all keyPaths in present into a new copy of state
export function mergePresent<T: Object>(state: T, present: Object, keyPaths: string[]): T {
  const newState = { ...state };
  keyPaths.forEach((path) => {
    const presentValue = get(present, path);
    if (presentValue) set(newState, path, presentValue);
  });
  return newState;
}

// Given a config object, returns function which compute new state after
// undoing/redoing/storing present as required by action.
export default function undoHistory(config: UndoHistoryConfig) {
  return <T: Object>(previousState: T, presentState: T, action: FSA) => {
    // Calculate un/redone history
    const undoHistoryState = presentState[config.reducerName];
    const updatedHistory = computeUndoStacks(
      undoHistoryState,
      action,
      previousState,
      presentState,
      config,
    );
    const updatedState = { ...presentState, [config.reducerName]: updatedHistory };

    // Applies undo and redo actions on overall app state
    // Applies updatedHistory.present to state if action.type === {UNDO,REDO}
    // Assumes updatedHistory.present is the final present state
    if ((action.type === UNDO || action.type === REDO) && updatedHistory.present) {
      return mergePresent(updatedState, updatedHistory.present, config.keyPathsToPersist);
    }
    return updatedState;
  };
}
