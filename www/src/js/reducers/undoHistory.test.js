// @flow
import { undo, redo, UNDO, REDO } from 'actions/undoHistory';
import update from 'immutability-helper';
import { pick } from 'lodash';
import undoHistory, {
  computeUndoStacks,
  mergePresent,
  type UndoHistoryState,
  type UndoHistoryConfig,
} from 'reducers/undoHistory';

const WATCHED_ACTION = 'WATCHED_ACTION';
const IGNORED_ACTION = 'IGNORED_ACTION';

type TestState = {
  data: {
    toMutate: {
      numbers: number[],
      string: string,
    },
    notToTouch: number[],
  },
  untouchable: { payload: string },
  undoHistoryState: UndoHistoryState,
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
  undoHistoryState: { past: [], present: undefined, future: [] },
};

const mutatedState = update(state, {
  data: {
    toMutate: { string: { $set: 'yo' } },
    notToTouch: { $push: [1] },
  },
});

const config: UndoHistoryConfig = {
  reducerName: 'undoHistoryState',
  actionsToWatch: [WATCHED_ACTION],
  keyPathsToPersist: ['data.toMutate.numbers', 'data.toMutate.string'],
};

describe('#computeUndoStacks()', () => {
  test('ignores irrelevant actions', () => {
    const hist0 = state.undoHistoryState;
    const hist1 = computeUndoStacks(hist0, IGNORED_ACTION, state, mutatedState, config);
    expect(hist1).toEqual(hist0);
  });

  test('stores data when relevant actions dispatched', () => {
    const hist0 = update(state.undoHistoryState, { future: { $push: [state] } });
    const hist1 = computeUndoStacks(hist0, WATCHED_ACTION, state, mutatedState, config);
    const hist2 = computeUndoStacks(hist1, WATCHED_ACTION, mutatedState, state, config);

    // Expect history to change
    expect(hist1).not.toEqual(hist0);

    // Erases future
    expect(hist0.future).toHaveLength(1);
    expect(hist1.future).toHaveLength(0);

    // Add present to past if present did not exist
    expect(hist0.past).toHaveLength(0);
    expect(hist0.present).toBeUndefined(); // Present did not exist
    expect(hist1.past).toHaveLength(1);
    expect(hist1.past[0]).toEqual(pick(state, config.keyPathsToPersist));

    // Set new present
    const present1 = pick(mutatedState, config.keyPathsToPersist);
    expect(hist1.present).toEqual(present1);
    expect(hist1.present).not.toEqual(pick(state, config.keyPathsToPersist)); // Just make sure both states are different

    // Add present to past if present exists
    expect(hist2.past).toHaveLength(2);
    expect(hist2.past[1]).toEqual(present1);
    expect(hist2.present).toEqual(pick(state, config.keyPathsToPersist));
  });

  test('undo', () => {
    const hist0 = state.undoHistoryState; // Empty past, present and future
    const hist1 = computeUndoStacks(hist0, WATCHED_ACTION, state, mutatedState, config); // Populate past and present

    // Expect present to be pushed to future
    const hist2 = computeUndoStacks(hist1, UNDO, mutatedState, mutatedState, config); // Undo
    expect(hist2.future).toHaveLength(1);
    expect(hist2.future[0]).toEqual(hist1.present);
    // Expect past to be popped
    expect(hist2.past).toHaveLength(0);
    // Expect present to be popped past
    expect(hist2.present).toEqual(hist1.past[0]);

    // If no past, do nothing
    const hist3 = computeUndoStacks(hist2, UNDO, state, state, config); // Undo again
    expect(hist3).toEqual(hist2);

    // If present doesn't exist, do nothing
    const noPresent = update(hist1, { present: { $set: undefined } }); // Past but no present
    const undoneNoPresent = computeUndoStacks(noPresent, UNDO, mutatedState, mutatedState, config); // Undo
    expect(undoneNoPresent).toEqual(noPresent);
  });

  test('redo', () => {
    const hist0 = state.undoHistoryState; // Empty past, present and future
    const hist1 = computeUndoStacks(hist0, WATCHED_ACTION, state, mutatedState, config); // Populate past and present
    const hist2 = computeUndoStacks(hist1, UNDO, mutatedState, mutatedState, config); // Populate present and future, clears past

    // Expect present to be pushed to past
    const hist3 = computeUndoStacks(hist2, REDO, state, state, config); // Redo
    expect(hist3.past).toHaveLength(1);
    expect(hist3.past[0]).toEqual(hist2.present);
    // Expect future to be popped
    expect(hist3.future).toHaveLength(0);
    // Expect present to be popped future
    expect(hist3.present).toEqual(hist2.future[0]);

    // If no future, do nothing
    const hist4 = computeUndoStacks(hist3, REDO, mutatedState, mutatedState, config); // Redo again
    expect(hist4).toEqual(hist3);

    // If present doesn't exist, do nothing
    const noPresent = update(hist2, { present: { $set: undefined } }); // Future but no present
    const redoneNoPresent = computeUndoStacks(noPresent, REDO, state, state, config); // Redo
    expect(redoneNoPresent).toEqual(noPresent);
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
  const unredo = undoHistory(config);

  test('sets history state and merges present state', () => {
    const hist0 = state.undoHistoryState; // Empty past, present and future
    const hist1 = computeUndoStacks(hist0, WATCHED_ACTION, state, mutatedState, config); // Populate past and present

    // Updates state if watched action dispatched
    const state0 = unredo(state, mutatedState, { type: WATCHED_ACTION, payload: {} }); // undoHistoryState populated
    expect(state0.undoHistoryState).toEqual(hist1);

    // Expect undo to change a subset of data and change history state
    const state1 = unredo(state0, state0, undo()); // Undo
    expect(state1.data.notToTouch).toEqual(state0.data.notToTouch); // Make sure what's not persisted is not touched
    expect(state1).not.toEqual(state0);
    expect(state1.undoHistoryState).not.toEqual(state0.undoHistoryState);

    // Expect redo to reset a subset of data and history state
    const state2 = unredo(state1, state1, redo()); // Redo
    expect(state2).toEqual(state0);
    expect(state2.undoHistoryState).toEqual(state0.undoHistoryState);
  });
});
