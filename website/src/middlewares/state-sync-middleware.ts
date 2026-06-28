import { OPEN_NOTIFICATION, POP_NOTIFICATION } from 'actions/app';
import type { AnyAction } from 'redux';
import { PERSIST, PURGE, REHYDRATE } from 'redux-persist';
import {
  createStateSyncMiddleware,
  initStateWithPrevTab,
  withReduxStateSync,
  RECEIVE_INIT_STATE,
  type Config,
} from 'redux-state-sync';

import { FAILURE, REQUEST } from 'types/reducers';
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
    const blacklist = [
      PERSIST,
      PURGE,
      REHYDRATE,
      OPEN_NOTIFICATION,
      POP_NOTIFICATION,
      RECEIVE_INIT_STATE,
    ];

    // redux-state-sync relies on BroadcastChannel, which only supports
    // objects that are clonable by `structuredClone`
    if (typeof action === 'function') {
      return false;
    }

    // The `requests` slice is a per-tab loading-status indicator -- it's
    // already stripped in `prepareState` for init sync, and no reducer outside
    // the slice itself reads `_REQUEST` / `_FAILURE` actions. Filtering both
    // here keeps the slice's contract honest (per-tab) and avoids observer
    // tabs getting stuck at REQUEST when `_FAILURE` can't be cloned (the
    // AxiosError payload holds an XMLHttpRequest reference, which
    // structuredClone refuses). `_SUCCESS` is kept -- it carries the response
    // data that hydrates shared slices like `moduleBank` / `venueBank`.
    // Action types are dynamic (e.g. `FETCH_MODULE_LIST_FAILURE`), so we
    // discriminate on the lifecycle meta rather than a static type list.
    const requestStatus = action.meta?.requestStatus;
    if (requestStatus === REQUEST || requestStatus === FAILURE) {
      return false;
    }

    return !blacklist.includes(action.type);
  },
  prepareState,
} satisfies Config;

const stateSyncMiddleware = createStateSyncMiddleware(reduxStateSyncConfig);

export { initStateWithPrevTab, withReduxStateSync };
export default stateSyncMiddleware;
