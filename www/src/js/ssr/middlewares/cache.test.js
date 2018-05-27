// @flow
import fs from 'fs';
import crypto from 'crypto';
import mockFs from 'mock-fs';
import zlib from 'zlib';
import iltorb from 'iltorb';
import { streamToString } from 'utils/test-util';
import createCacheMiddleware from './cache';

const CACHE_NAME = 'cache';
const getCacheFileNames = (filename) => {
  const hash = crypto.createHash('sha1');
  hash.update(filename);

  const cacheName = hash.digest('hex');
  return [cacheName, `${cacheName}.br`, `${cacheName}.gz`];
};

describe(createCacheMiddleware, () => {
  let cache;
  let ctx: Object;

  const next = async () => {
    ctx.body = 'Test content';
    ctx.status = 200;
  };

  const getCtx = (): Object => ({
    body: undefined,
    status: 404,
    path: 'test',
    set: (prop, val) => {
      ctx[prop.toLowerCase()] = val;
    },
    acceptsEncodings: jest.fn().mockReturnValue('identity'),
  });

  beforeEach(() => {
    mockFs();
    cache = createCacheMiddleware(CACHE_NAME);
    ctx = getCtx();
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe('cold cache', () => {
    it('should save uncached files into the cache directory', async () => {
      await cache(ctx, next);

      expect(fs.readdirSync('.')).toEqual([CACHE_NAME]);
      expect(fs.readdirSync(CACHE_NAME).sort()).toEqual(getCacheFileNames(ctx.path));
    });

    it('should return unencoded content by default', async () => {
      await cache(ctx, next);

      expect(ctx.body).toEqual('Test content');
    });

    it('should return gzipped content if UA accepts it', async () => {
      ctx.acceptsEncodings.mockReturnValue('gzip');
      await cache(ctx, next);

      expect(ctx.body).toEqual(zlib.gzipSync('Test content'));
      expect(ctx['content-encoding']).toEqual('gzip');
      expect(fs.readdirSync(CACHE_NAME).sort()).toEqual(getCacheFileNames(ctx.path));
    });

    it('should return brotli content if UA accepts it', async () => {
      ctx.acceptsEncodings.mockReturnValue('br');
      await cache(ctx, next);

      expect(ctx.body).toEqual(iltorb.compressSync(Buffer.from('Test content')));
      expect(ctx['content-encoding']).toEqual('br');
      expect(fs.readdirSync(CACHE_NAME).sort()).toEqual(getCacheFileNames(ctx.path));
    });
  });

  describe('hot cache', () => {
    beforeEach(() => {
      mockFs({
        cache: {
          a94a8fe5ccb19ba61c4c0873d391e987982fbbd3: 'Test content (cached)',
          'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3.br': 'Test content (cached brotli)',
          'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3.gz': 'Test content (cached gzip)',
        },
      });
    });

    it('should not call next middleware', async () => {
      const mockNext = jest.fn();
      await cache(ctx, mockNext);

      expect(mockNext).not.toBeCalled();
      expect(await streamToString(ctx.body)).toEqual('Test content (cached)');
      expect(ctx.type).toEqual('html');
    });

    it('should return cached gzip content when the UA accepts it', async () => {
      ctx.acceptsEncodings.mockReturnValue('gzip');
      const mockNext = jest.fn();
      await cache(ctx, mockNext);

      expect(mockNext).not.toBeCalled();
      expect(await streamToString(ctx.body)).toEqual('Test content (cached gzip)');
      expect(ctx['content-encoding']).toEqual('gzip');
    });

    it('should return cached brotli content when the UA accepts it', async () => {
      ctx.acceptsEncodings.mockReturnValue('br');
      const mockNext = jest.fn();
      await cache(ctx, mockNext);

      expect(mockNext).not.toBeCalled();
      expect(await streamToString(ctx.body)).toEqual('Test content (cached brotli)');
      expect(ctx['content-encoding']).toEqual('br');
    });
  });
});
