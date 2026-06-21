import type { AnyAction, Middleware, Reducer, Store } from 'redux';

export const RECEIVE_INIT_STATE = '&_RECEIVE_INIT_STATE';

export function createStateSyncMiddleware(): Middleware {
  return () => (next) => (action) => next(action);
}

// Mirrors the real library's signature so callers can pass a `receiveState`
// callback and tests can exercise the RECEIVE_INIT_STATE merge path by
// dispatching the action against a store built with the wrapped reducer.
export function withReduxStateSync<T extends Reducer>(
  reducer: T,
  receiveState?: (prevState: unknown, nextState: unknown) => unknown,
): T {
  const wrapped: Reducer = (state, action: AnyAction) => {
    if (action.type === RECEIVE_INIT_STATE) {
      const nextState = receiveState ? receiveState(state, action.payload) : action.payload;
      return reducer(nextState, action);
    }
    return reducer(state, action);
  };
  return wrapped as T;
}

export function initStateWithPrevTab(store: Store): Store {
  return store;
}
