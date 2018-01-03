// @flow

import { type PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const basePersistConfig = (
  key: string,
  options: $Diff<PersistConfig, { key: string, storage: Object }> = {},
): PersistConfig => ({
  key,
  storage,
  ...options,
});

export default basePersistConfig;
