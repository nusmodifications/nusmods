import { Reducer } from 'redux';
import { PersistConfig, Persistor } from 'redux-persist/lib/types';
import { persistReducer as basePersistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { Actions } from 'types/actions';

// Re-export type for easier consumption in other parts of the project
export { PersistConfig, Persistor };

/**
 * Wrapper function around persistReducer from Redux Persist.
 */
export default function persistReducer<S>(
  key: string,
  reducer: Reducer<S, Actions>,
  options: Pick<
    PersistConfig<S>,
    Exclude<keyof PersistConfig<S>, keyof { key: string; storage: Record<string, unknown> }>
  > = {},
) {
  return (basePersistReducer<S, Actions>(
    {
      key,
      storage,
      debug: NUSMODS_ENV === 'development',
      ...options,
    },
    reducer,
  ) as unknown) as Reducer<S, Actions>; // We'll pretend the persist keys don't exist - the base reducers shouldn't access them anyway
}
