import { OPEN_NOTIFICATION } from 'actions/app';
import type { AnyAction } from 'redux';
import { PERSIST, PURGE, REHYDRATE } from 'redux-persist';
import {
  createStateSyncMiddleware,
  initStateWithPrevTab,
  withReduxStateSync,
  RECEIVE_INIT_STATE,
  type Config,
} from 'redux-state-sync';

import { FAILURE } from 'types/reducers';
import type { State } from 'types/state';

// Strip slices that can't traverse structuredClone (notifications hold
// function handlers; AxiosError instances in requests don't round-trip) and
// per-tab transients that shouldn't bleed across tabs. Applied when a tab
// broadcasts its state to a newly opened peer.
const prepareState = (state: State): State => ({
  ...state,
  requests: {},
  app: { ...state.app, notifications: [] },
});

// When a freshly opened tab adopts a peer's state, keep this tab's own
// in-flight requests and notification queue rather than the stripped versions.
export const receiveState = (prevState: State, nextState: State): State => ({
  ...nextState,
  requests: prevState.requests,
  app: { ...nextState.app, notifications: prevState.app.notifications },
});

const reduxStateSyncConfig = {
  // Reference: https://github.com/aohua/redux-state-sync/issues/121#issuecomment-1770588046
  // TL/DR: Channel name (which is set to a string in the default config) is auto-converted
  // to the string "undefined" in the browser, but not in the test (jest) environment
  channel: 'redux_state_sync',
  predicate: (action: AnyAction) => {
    // Reference: https://github.com/aohua/redux-state-sync/issues/53
    const blacklist = [PERSIST, PURGE, REHYDRATE, OPEN_NOTIFICATION, RECEIVE_INIT_STATE];

    // redux-state-sync relies on BroadcastChannel, which only supports
    // objects that are clonable by `structuredClone`
    if (typeof action === 'function') {
      return false;
    }

    // *_FAILURE actions carry an AxiosError as payload, which holds a
    // reference to the underlying XMLHttpRequest -- structuredClone throws
    // DataCloneError on those. Action types are dynamic (e.g.
    // `FETCH_MODULE_LIST_FAILURE`), so discriminate on the lifecycle meta.
    if (action.meta?.requestStatus === FAILURE) {
      return false;
    }

    return !blacklist.includes(action.type);
  },
  prepareState,
} satisfies Config;

const stateSyncMiddleware = createStateSyncMiddleware(reduxStateSyncConfig);

export { initStateWithPrevTab, withReduxStateSync };
export default stateSyncMiddleware;
