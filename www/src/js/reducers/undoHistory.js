// @flow
import type { FSA } from 'types/redux';

import { assign, pick } from 'lodash';
import { UNDO, REDO } from 'actions/undoHistory';

export type UndoHistoryConfig = {
  reducerName: string,
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
  actionType: string,
  previousAppState: T,
  presentAppState: T,
  config: UndoHistoryConfig,
): UndoHistoryState {
  const { past, present, future } = state;

  // If action is undo/redoable, store state
  if (config.actionsToWatch.includes(actionType)) {
    return {
      past: [...past, present || pick(previousAppState, config.keyPathsToPersist)],
      present: pick(presentAppState, config.keyPathsToPersist),
      future: [],
    };
  }

  switch (actionType) {
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
    default: {
      return state;
    }
  }
}

// Given a config object, returns function which compute new state after
// undoing/redoing/storing present as required by action.
export default function undoHistory(config: UndoHistoryConfig) {
  return <T: Object>(previousState: T, presentState: T, action: FSA) => {
    // Calculate un/redone history
    const undoHistoryState = presentState[config.reducerName];
    const updatedHistory = computeUndoStacks(
      undoHistoryState,
      action.type,
      previousState,
      presentState,
      config,
    );
    const updatedState = { ...presentState, [config.reducerName]: updatedHistory };

    // Applies undo and redo actions on overall app state
    // Applies updatedHistory.present to state if action.type === {UNDO,REDO}
    // Assumes updatedHistory.present is the final present state
    if ((action.type === UNDO || action.type === REDO) && updatedHistory.present) {
      return assign(updatedState, updatedHistory.present);
    }
    return updatedState;
  };
}
