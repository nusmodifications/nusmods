// @flow
import type { Reducer } from 'redux';
import type { FSA } from 'types/redux';
import { SYNC_DATA_RECEIVED } from 'actions/sync';

// Reducer enhancer that merges the server's copy of the reducer's state with
// the reducer's local state.
// `key` is reducer's key in the synced database (e.g. 'timetables', 'settings', etc)
const syncReducer = <S>(key: string, reducer: Reducer<S, FSA>) => (state: S, action: FSA): S => {
  if (action.type === SYNC_DATA_RECEIVED) {
    return {
      ...state,
      ...action.payload.newState[key],
    };
  }
  return reducer(state, action);
};

export default syncReducer;
