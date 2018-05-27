// @flow
import type { Middleware } from 'koa';
import fs from 'mz/fs';
import zlib from 'mz/zlib';
import path from 'path';
import crypto from 'crypto';
import iltorb from 'iltorb';
import mkdirp from 'mkdirp';

export default function createCacheMiddleware(cachePath: string = 'cache'): Middleware {
  mkdirp.sync(cachePath);

  return async (ctx, next) => {
    const useBr = ctx.acceptsEncodings('br', 'identity') === 'br';
    const useGzip = ctx.acceptsEncodings('gzip', 'identity') === 'gzip';

    // Calculate cache filename as a SHA1 hash of path
    const hash = crypto.createHash('sha1');
    hash.update(ctx.path);
    const filename = path.join(cachePath, hash.digest('hex'));
    let extension = '';

    // Load the appropriate file based on available encoding
    if (useBr) {
      extension = '.br';
    } else if (useGzip) {
      extension = '.gz';
    }

    try {
      const stats = await fs.stat(filename);
      ctx.body = fs.createReadStream(filename + extension);

      ctx.set('Content-Length', stats.size);
      ctx.type = 'html';

      if (useBr) {
        ctx.set('Content-Encoding', 'br');
      } else if (useGzip) {
        ctx.set('Content-Encoding', 'gzip');
      }
    } catch (e) {
      await next();

      if (ctx.status === 200 && ctx.body) {
        if (typeof ctx.body === 'string' || Buffer.isBuffer(ctx.body)) {
          // gzip and brotli the content
          const buffer = typeof ctx.body === 'string' ? Buffer.from(ctx.body) : ctx.body;
          const [brotlied, gzipped] = await Promise.all([
            iltorb.compress(buffer),
            zlib.gzip(ctx.body),
          ]);

          if (useBr) {
            ctx.body = brotlied;
            ctx.set('Content-Encoding', 'br');
            ctx.set('Content-Length', brotlied.length);
          } else if (useGzip) {
            ctx.body = gzipped;
            ctx.set('Content-Encoding', 'gzip');
            ctx.set('Content-Length', gzipped.length);
          }

          await Promise.all([
            fs.writeFile(filename, ctx.body),
            fs.writeFile(`${filename}.br`, brotlied),
            fs.writeFile(`${filename}.gz`, gzipped),
          ]);
        }
      }
    }
  };
}
