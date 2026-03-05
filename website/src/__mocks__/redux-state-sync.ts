import type { Middleware } from 'redux';

// eslint-disable-next-line import/prefer-default-export
export function createStateSyncMiddleware(): Middleware {
  return () => (next) => (action) => next(action);
}
