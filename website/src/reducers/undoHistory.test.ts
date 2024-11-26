import { produce } from 'immer';
import { pick } from 'lodash';

import { redo, undo } from 'actions/undoHistory';
import undoHistory, {
  computeUndoStacks,
  mergePresent,
  UndoHistoryConfig,
} from 'reducers/undoHistory';
import { UndoHistoryState } from 'types/reducers';
import { Actions } from 'types/actions';

const WATCHED_ACTION = 'WATCHED_ACTION';
const IGNORED_ACTION = 'IGNORED_ACTION';

const newFSA = (type: string, payload: Record<string, any> = {}) => ({ type, payload } as Actions);

const emptyUndoHistory = { past: [], present: undefined, future: [] };

type TestState = {
  data: {
    toMutate: {
      numbers: number[];
      string: string;
    };
    notToTouch: number[];
  };
  untouchable: { payload: string };
  undoHistory: UndoHistoryState<TestState>;
};

const state: TestState = {
  data: {
    toMutate: {
      numbers: [1, 2, 3],
      string: 'hi',
    },
    notToTouch: [3, 1, 4],
  },
  untouchable: { payload: 'donottouch' },
  undoHistory: emptyUndoHistory,
};

const mutatedState = produce(state, (draft) => {
  draft.data.toMutate.string = 'yo';
  draft.data.notToTouch.push(1);
});

const config: UndoHistoryConfig = {
  actionsToWatch: [WATCHED_ACTION],
  storedKeyPaths: ['data.toMutate.numbers', 'data.toMutate.string'],
};

describe('#computeUndoStacks()', () => {
  test('should ignore irrelevant actions', () => {
    const hist0 = state.undoHistory;
    const hist1 = computeUndoStacks(hist0, newFSA(IGNORED_ACTION), state, mutatedState, config);
    expect(hist1).toEqual(hist0);
  });

  test('should store data when relevant actions dispatched', () => {
    const hist0 = produce(state.undoHistory, (draft) => {
      draft.future.push(state);
    });
    const hist1 = computeUndoStacks(hist0, newFSA(WATCHED_ACTION), state, mutatedState, config);
    const hist2 = computeUndoStacks(hist1, newFSA(WATCHED_ACTION), mutatedState, state, config);

    // Expect history to change
    expect(hist1).not.toEqual(hist0);

    // Erases future
    expect(hist0.future).toHaveLength(1);
    expect(hist1.future).toHaveLength(0);

    // Add present to past if present did not exist
    expect(hist0.past).toHaveLength(0);
    expect(hist0.present).toBeUndefined(); // Present did not exist
    expect(hist1.past).toHaveLength(1);
    expect(hist1.past[0]).toEqual(pick(state, config.storedKeyPaths));

    // Set new present
    const present1 = pick(mutatedState, config.storedKeyPaths);
    expect(hist1.present).toEqual(present1);
    expect(hist1.present).not.toEqual(pick(state, config.storedKeyPaths)); // Just make sure both states are different

    // Add present to past if present exists
    expect(hist2.past).toHaveLength(2);
    expect(hist2.past[1]).toEqual(present1);
    expect(hist2.present).toEqual(pick(state, config.storedKeyPaths));
  });

  test('should undo', () => {
    const hist0 = state.undoHistory; // Empty past, present and future
    const hist1 = computeUndoStacks(hist0, newFSA(WATCHED_ACTION), state, mutatedState, config); // Populate past and present

    // Expect present to be pushed to future
    const hist2 = computeUndoStacks(hist1, undo(), mutatedState, mutatedState, config); // Undo
    expect(hist2.future).toHaveLength(1);
    expect(hist2.future[0]).toEqual(hist1.present);
    // Expect past to be popped
    expect(hist2.past).toHaveLength(0);
    // Expect present to be popped past
    expect(hist2.present).toEqual(hist1.past[0]);

    // If no past, do nothing - no undoing beyond recorded history
    const hist3 = computeUndoStacks(hist2, undo(), state, state, config); // Undo again
    expect(hist3).toEqual(hist2);

    // If present doesn't exist, do nothing - edge case which should not be encountered
    const hist4 = produce(hist1, (draft) => {
      draft.present = undefined; // Past but no present
    });
    const hist5 = computeUndoStacks(hist4, undo(), mutatedState, mutatedState, config); // Undo
    expect(hist5).toEqual(hist4);
  });

  test('should redo', () => {
    const hist0 = state.undoHistory; // Empty past, present and future
    const hist1 = computeUndoStacks(hist0, newFSA(WATCHED_ACTION), state, mutatedState, config); // Populate past and present
    const hist2 = computeUndoStacks(hist1, undo(), mutatedState, mutatedState, config); // Populate present and future, clears past

    // Expect present to be pushed to past
    const hist3 = computeUndoStacks(hist2, redo(), state, state, config); // Redo
    expect(hist3.past).toHaveLength(1);
    expect(hist3.past[0]).toEqual(hist2.present);
    // Expect future to be popped
    expect(hist3.future).toHaveLength(0);
    // Expect present to be popped future
    expect(hist3.present).toEqual(hist2.future[0]);

    // If no future, do nothing - no redoing beyond recorded future
    const hist4 = computeUndoStacks(hist3, redo(), mutatedState, mutatedState, config); // Redo again
    expect(hist4).toEqual(hist3);

    // If present doesn't exist, do nothing - edge case which should not be encountered
    const noPresent = produce(hist2, (draft) => {
      draft.present = undefined; // Future but no present
    });
    const redoneNoPresent = computeUndoStacks(noPresent, redo(), state, state, config); // Redo
    expect(redoneNoPresent).toEqual(noPresent);
  });

  test('should enforce limit if present', () => {
    // Config without limit already tested in other cases
    // Do not test null/undefined limit since Typescript should already catch that case
    const limit1 = { ...config, limit: 1 };
    const limit0 = { ...config, limit: 0 }; // Edge case
    const limitN = { ...config, limit: -1 }; // Edge case

    // Expect limit > 0 to be enforced
    const hist0 = state.undoHistory; // Empty past, present and future
    const hist10 = computeUndoStacks(hist0, newFSA(WATCHED_ACTION), state, mutatedState, limit1); // Populate past and present
    const hist11 = computeUndoStacks(hist10, newFSA(WATCHED_ACTION), mutatedState, state, limit1);
    expect(hist11.past).toHaveLength(1); // Expect length to be limited
    expect(hist11.past).not.toEqual(hist10.past); // Expect older past to be dropped
    expect(hist11.past[0]).toEqual(hist10.present); // Expect previous present to be left

    // Expect limit = 0 to be enforced
    const hist00 = computeUndoStacks(hist0, newFSA(WATCHED_ACTION), state, mutatedState, limit0); // Populate past and present
    expect(hist00.past).toHaveLength(0); // Expect length to be capped to 0

    // Expect negative limit to be enforced as if limit = 0 was set
    const histN0 = computeUndoStacks(hist0, newFSA(WATCHED_ACTION), state, mutatedState, limitN); // Populate past and present
    expect(histN0.past).toHaveLength(0); // Expect length to be capped to 0
  });
});

describe('#mergePresent()', () => {
  test('should copy only specified key paths that exist', () => {
    // Key paths which do not exist in present should not be copied to state
    // Key paths in present which aren't specified in keyPaths should not be copied
    // Deep copy should be possible
    // Objects should not be copied over unless the key path points to them
    const unmergedState = {
      data1: { one: [1], two: 2, three: { apollo: ['1', '11'] } },
      data2: [3, 1, 4],
      data3: { a: 3, b: 3, c: 3 },
    };
    const present = {
      data1: { one: [2], two: 4, three: { falcon: ['9', 'Heavy'] } },
      data3: { derp: 'derpina' },
      data4: 'ignored4lyf',
    };
    const keyPaths = ['data1.one', 'data1.three', 'data2', 'covfefe', 'data3'];
    const mergedState = mergePresent(unmergedState, present, keyPaths);
    expect(mergedState).toEqual({
      data1: { one: [2], two: 2, three: present.data1.three },
      data2: unmergedState.data2,
      data3: present.data3,
    });
  });
});

describe('#undoHistory()()', () => {
  const unredo = undoHistory<TestState>(config);

  test('should set history state and merges present state', () => {
    const hist0 = state.undoHistory; // Empty past, present and future
    const hist1 = computeUndoStacks(hist0, newFSA(WATCHED_ACTION), state, mutatedState, config); // Populate past and present

    // Updates state if watched action dispatched
    const state0 = unredo(state, mutatedState, newFSA(WATCHED_ACTION)); // undoHistoryState populated
    expect(state0.undoHistory).toEqual(hist1);

    // Expect undo to change a subset of data and change history state
    const state1 = unredo(state0, state0, undo()); // Undo
    expect(state1.data.notToTouch).toEqual(state0.data.notToTouch); // Make sure what's not persisted is not touched
    expect(state1).not.toEqual(state0);
    expect(state1.undoHistory).not.toEqual(state0.undoHistory);

    // Expect redo to reset a subset of data and history state
    const state2 = unredo(state1, state1, redo()); // Redo
    expect(state2).toEqual(state0);
    expect(state2.undoHistory).toEqual(state0.undoHistory);
  });
});
