// @flow
import type { Middleware } from 'koa';
import fs from 'mz/fs';
import path from 'path';

// Forwards asset requests to the dist folder during development. Do not using
// in production.
export default function createAssetProxyMiddleware(assetPath: string): Middleware {
  return async (ctx, next) => {
    if (/\.(css|png|js)$/.test(ctx.path)) {
      const dirname = path.dirname(assetPath);
      ctx.body = fs.createReadStream(path.join(dirname, ctx.path));
      ctx.type = path.extname(ctx.path);
    } else {
      await next();
    }
  };
}
