import type { Middleware } from 'redux';

export function createStateSyncMiddleware(): Middleware {
  return () => (next) => (action) => next(action);
}
