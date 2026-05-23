import type { Middleware, Reducer, Store } from 'redux';

export function createStateSyncMiddleware(): Middleware {
  return () => (next) => (action) => next(action);
}

export function withReduxStateSync<T extends Reducer>(reducer: T): T {
  return reducer;
}

export function initStateWithPrevTab(store: Store): Store {
  return store;
}

export const RECEIVE_INIT_STATE = '&_RECEIVE_INIT_STATE';
