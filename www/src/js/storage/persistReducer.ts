import { Reducer } from 'redux';
import { PersistConfig, Persistor } from 'redux-persist/lib/types';
import { persistReducer as basePersistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Re-export type for easier consumption in other parts of the project
export { PersistConfig, Persistor };

/**
 * Wrapper function around persistReducer from Redux Persist.
 */
export default function persistReducer(
  key: string,
  reducer: Reducer<any, any>,
  options: Pick<
    PersistConfig,
    Exclude<keyof PersistConfig, keyof { key: string; storage: Record<string, any> }>
  > = {},
) {
  return basePersistReducer<any, any>(
    {
      key,
      storage,
      debug: process.env.NODE_ENV !== 'production',
      ...options,
    },
    reducer,
  );
}
