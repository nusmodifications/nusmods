// @flow
import type { FSA } from 'types/redux';
import type { State } from 'reducers';

import { assign, pick } from 'lodash';
import { UNDO, REDO } from 'actions/undoHistory';
import { ADD_MODULE, REMOVE_MODULE } from 'actions/timetables';

type UndoHistoryConfig = {
  reducerName: string,
  actionsToWatch: string[],
  keyPathsToPersist: string[],
};

const undoHistoryConfig: UndoHistoryConfig = {
  reducerName: 'undoHistory',
  actionsToWatch: [ADD_MODULE, REMOVE_MODULE],
  keyPathsToPersist: ['timetables'],
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
export function computeUndoStacks(
  state: UndoHistoryState = initialState,
  actionType: string,
  previousAppState: State,
  presentAppState: State,
): UndoHistoryState {
  const { past, present, future } = state;

  // If action is undo/redoable, store state
  if (undoHistoryConfig.actionsToWatch.includes(actionType)) {
    return {
      past: [...past, present || pick(previousAppState, undoHistoryConfig.keyPathsToPersist)],
      present: pick(presentAppState, undoHistoryConfig.keyPathsToPersist),
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

// Compute new state after undoing/redoing/storing present as required by action
export default function unredo(previousState: State, presentState: State, action: FSA): State {
  // Calculate un/redone history
  const { reducerName } = undoHistoryConfig;
  const undoHistoryState = presentState[reducerName];
  const updatedHistory = computeUndoStacks(
    undoHistoryState,
    action.type,
    previousState,
    presentState,
  );
  const updatedState = { ...presentState, [reducerName]: updatedHistory };

  // Applies undo and redo actions on overall app state
  // Applies updatedHistory.present to state if action.type === {UNDO,REDO}
  // Assumes updatedHistory.present is the final present state
  if ((action.type === UNDO || action.type === REDO) && updatedHistory.present) {
    return assign(updatedState, updatedHistory.present);
  }
  return updatedState;
}
