// @flow

import type { Reducer } from 'redux';
import type { PersistConfig, Persistor } from 'redux-persist/lib/types';
import { persistReducer as basePersistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Re-export type for easier consumption in other parts of the project
export type { PersistConfig, Persistor };

/**
 * Wrapper function around persistReducer from Redux Persist.
 */
export default function persistReducer(
  key: string,
  reducer: Reducer<*, *>,
  options: $Diff<PersistConfig, { key: string, storage: Object }> = {},
) {
  return basePersistReducer<*, *>(
    {
      key,
      storage,
      debug: process.env.NODE_ENV !== 'production',
      ...options,
    },
    reducer,
  );
}
