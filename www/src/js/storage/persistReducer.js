// @flow

import type { Reducer } from 'redux';
import { persistReducer as basePersistReducer, type PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

/**
 * Wrapper function around persistReducer from Redux Persist.
 */
export default function persistReducer(
  key: string,
  reducer: Reducer<*, *>,
  options: $Diff<PersistConfig, { key: string, storage: Object }> = {},
) {
  return basePersistReducer(
    {
      key,
      storage,
      ...options,
    },
    reducer,
  );
}
