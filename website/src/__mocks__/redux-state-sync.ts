import type { Middleware } from 'redux';

module.exports = {
  createStateSyncMiddleware(): Middleware {
    return () => (next) => (action) => next(action);
  },
};
