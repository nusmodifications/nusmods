// @flow
import { syncDataReceived } from 'actions/sync';
import syncReducer from './sync';

const reducer = <T>(state: T): T => state;

const existKey = 'existReducerKey';

const initialStoreState = (key: string): Object => ({
  [key]: {
    key1: 'untouched',
    key2: {
      key1: 'val',
      key2: 'val',
      key3: 'deletedVal',
    },
    key3: 'unsynced',
  },
});
const serverStoreState = (key: string): Object => ({
  [key]: {
    key1: 'untouched',
    key2: {
      key1: 'val',
      key2: 'changedVal',
      key4: 'addedVal',
    },
  },
});

describe('#syncReducer()', () => {
  test('merges server state for reducer', () => {
    const configuredReducer = syncReducer(existKey, reducer);
    const initialReducerState = initialStoreState(existKey)[existKey];
    const finalReducerState = configuredReducer(
      initialReducerState,
      syncDataReceived(serverStoreState(existKey)),
    );
    expect(finalReducerState).toEqual({
      ...initialReducerState,
      ...serverStoreState(existKey)[existKey],
    });
  });

  test('ignores server states without a copy of this reducers state', () => {
    const configuredReducer = syncReducer('otherKey', reducer);
    const initialReducerState = initialStoreState(existKey)[existKey];
    const finalReducerState = configuredReducer(
      initialReducerState,
      syncDataReceived(serverStoreState(existKey)),
    );
    expect(finalReducerState).toEqual(initialReducerState);
  });
});
