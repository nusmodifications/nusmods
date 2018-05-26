// @flow
import type { Middleware } from 'koa';

const timeMiddleware: Middleware = async (ctx, next) => {
  const start = Date.now();

  await next();

  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
};

export default timeMiddleware;
