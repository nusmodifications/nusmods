// @flow

import * as fs from 'fs-extra';
import { getCacheFactory } from './io';
import { CacheExpiredError } from '../utils/errors';

const hourToMs = 60 * 60 * 1000;

describe(getCacheFactory, () => {
  const getCache = getCacheFactory('2018/2019');

  test('should write/read to the correct path', () => {
    const cache = getCache<string>('test');
    expect(cache.path).toMatch('2018-2019');
  });

  test('should allow cache file to be written', async () => {
    fs.outputJSON.mockResolvedValue();
    const cache = getCache<string>('test');
    await cache.write('Some test data');

    expect(fs.outputJSON).toBeCalledWith(
      expect.stringContaining('test.json'),
      'Some test data',
      expect.anything(),
    );
  });

  test('should read from cache if it is fresh', async () => {
    fs.readJSON.mockResolvedValue('Some test data');
    fs.stat.mockResolvedValue({
      mtimeMs: Date.now() - 6 * hourToMs, // 6 hours ago
    });

    const cache = getCache<string>('test');
    expect(await cache.read()).toEqual('Some test data');
  });

  test('should throw error if data is not fresh', async () => {
    fs.readJSON.mockResolvedValue('Some test data');
    fs.stat.mockResolvedValue({
      mtimeMs: Date.now() - 36 * hourToMs, // 36 hours ago
    });

    const cache = getCache<string>('test');
    await expect(cache.read()).rejects.toBeInstanceOf(CacheExpiredError);
  });

  test('should not throw if the custom expiry has not been reached yet', async () => {
    fs.readJSON.mockResolvedValue('Some test data');
    fs.stat.mockResolvedValue({
      mtimeMs: Date.now() - 36 * hourToMs, // 36 hours ago
    });

    const cache = getCache<string>('test', 48 * 60);
    expect(await cache.read()).toEqual('Some test data');
  });
});
