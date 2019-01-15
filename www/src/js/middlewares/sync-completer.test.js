// @flow
import type { Difference } from 'deep-diff';
import { SYNC_DATA_RECEIVED } from 'actions/sync';
import { createSyncCompleterMiddleware, fetchAddedModules } from './sync-completer';

describe('#createSyncCompleterMiddleware()', () => {
  const dispatchAction = { type: 'ACTION', payload: null };
  // eslint-disable-next-line no-unused-vars
  const syncCompleter = (dispatch, stateDiff, newState) => dispatch(dispatchAction);
  const middleware = createSyncCompleterMiddleware([syncCompleter, syncCompleter]);

  const oldState = { key1: 'val1' };
  const newState = { key1: 'val2' };

  test('should ignore actions which are not SYNC_DATA_RECEIVED', () => {
    const dispatch = jest.fn();
    const next = jest.fn();

    const store = {
      dispatch,
      getState: jest
        .fn()
        .mockReturnValueOnce(oldState)
        .mockReturnValueOnce(newState),
    };

    const action = { type: 'IRRELEVANT_ACTION', payload: null };
    middleware(store)(next)(action);

    expect(dispatch).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(action);
  });

  test('should ignore SYNC_DATA_RECEIVED actions which do not change state', () => {
    const dispatch = jest.fn();
    const next = jest.fn();

    const store = {
      dispatch,
      getState: jest.fn().mockReturnValue(oldState),
    };

    const action = { type: SYNC_DATA_RECEIVED, payload: null };
    middleware(store)(next)(action);

    expect(dispatch).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(action);
  });

  test('should call all completers when SYNC_DATA_RECEIVED action changes state', () => {
    const dispatch = jest.fn();
    const next = jest.fn();

    const store = {
      dispatch,
      getState: jest
        .fn()
        .mockReturnValueOnce(oldState)
        .mockReturnValueOnce(newState),
    };

    const action = { type: SYNC_DATA_RECEIVED, payload: null };
    middleware(store)(next)(action);

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenCalledWith(dispatchAction);
    expect(next).toHaveBeenCalledWith(action);
  });
});

describe('#fetchAddedModules()', () => {
  const moduleBank = {
    modules: {
      NM1010E: {},
      CS1231: {},
    },
  };

  const newState = { moduleBank };

  test('should fetch added modules', () => {
    const dispatch = jest.fn();
    const stateDiff: Difference[] = [
      {
        kind: 'N',
        path: ['timetables', 'lessons', '2', 'CS1010XCP'],
        rhs: {},
      },
      {
        kind: 'N',
        path: ['timetables', 'lessons', '1', 'GER1000'],
        rhs: {},
      },
    ];
    fetchAddedModules(dispatch, stateDiff, newState);
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  test('should ignore modules already in module bank', () => {
    const dispatch = jest.fn();
    const stateDiff: Difference[] = [
      {
        kind: 'N',
        path: ['timetables', 'lessons', '2', 'NM1010E'],
        rhs: {},
      },
      {
        kind: 'N',
        path: ['timetables', 'lessons', '1', 'CS1231'],
        rhs: {},
      },
    ];
    fetchAddedModules(dispatch, stateDiff, newState);
    expect(dispatch).not.toHaveBeenCalled();
  });

  test('should ignore other diffs', () => {
    const dispatch = jest.fn();
    const stateDiff: Difference[] = [
      {
        kind: 'N',
        path: ['non-timetables', 'lessons', '2', 'CS1010XCP'],
        rhs: {},
      },
      {
        kind: 'D',
        path: ['timetables', 'lessons', '2', 'CS1010XCP'],
        lhs: {},
      },
      {
        kind: 'E',
        path: ['timetables', 'lessons', '2', 'CS1010XCP'],
        lhs: {},
        rhs: {},
      },
      {
        kind: 'A',
        path: ['timetables', 'lessons', '2', 'CS1010XCP'],
        index: 3,
        item: { kind: 'N', path: ['wat'], rhs: {} },
      },
    ];
    fetchAddedModules(dispatch, stateDiff, newState);
    expect(dispatch).not.toHaveBeenCalled();
  });
});
