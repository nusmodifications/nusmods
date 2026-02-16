import type { AnyAction } from 'redux';
import { PERSIST, PURGE, REHYDRATE } from 'redux-persist';
import { createStateSyncMiddleware, type Config } from 'redux-state-sync';

const reduxStateSyncConfig = {
  // Reference: https://github.com/aohua/redux-state-sync/issues/121#issuecomment-1770588046
  // TL/DR: Channel name (which is set to a string in the default config) is auto-converted
  // to the string "undefined" in the browser, but not in the test (jest) environment
  channel: 'redux_state_sync',
  predicate: (action: AnyAction) => {
    // Reference: https://github.com/aohua/redux-state-sync/issues/53
    const blacklist = [PERSIST, PURGE, REHYDRATE];

    // redux-state-sync relies on BroadcastChannel, which only supports
    // objects that are clonable by `structuredClone`
    if (typeof action === 'function') {
      return false;
    }

    return !blacklist.includes(action.type);
  },
} satisfies Config;

const stateSyncMiddleware = createStateSyncMiddleware(reduxStateSyncConfig);

export default stateSyncMiddleware;
