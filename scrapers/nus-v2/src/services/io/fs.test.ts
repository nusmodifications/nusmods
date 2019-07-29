import * as fs from 'fs-extra';
import mockFs from 'mock-fs';
import { subHours } from 'date-fns';

import { getCacheFactory, getFileSystemWriter } from './fs';
import { CacheExpiredError } from '../../utils/errors';

jest.unmock('fs-extra');

beforeEach(() => {
  mockFs();
});

afterEach(() => {
  mockFs.restore();
});

describe(getCacheFactory, () => {
  const getCache = getCacheFactory('2018/2019');
  const CACHE_KEY = 'test';
  const CACHE_PATH = '2018-2019/cache/test.json';

  test('should write/read to the correct path', () => {
    const cache = getCache<string>(CACHE_KEY);
    expect(cache.path).toMatch('2018-2019');
  });

  test('should allow cache file to be written', async () => {
    const cache = getCache<string>(CACHE_KEY);
    await cache.write('Some test data');

    await expect(fs.readJSON(CACHE_PATH)).resolves.toEqual('Some test data');
  });

  test('should read from cache if it is fresh', async () => {
    mockFs({
      [CACHE_PATH]: JSON.stringify('Some test data'),
    });

    const cache = getCache<string>(CACHE_KEY);
    await expect(cache.read()).resolves.toEqual('Some test data');
  });

  test('should throw error if data is not fresh', async () => {
    mockFs({
      [CACHE_PATH]: mockFs.file({
        content: JSON.stringify('Some test data'),
        mtime: subHours(new Date(), 36), // 36 hours ago
      }),
    });

    const cache = getCache<string>(CACHE_KEY);
    await expect(cache.read()).rejects.toBeInstanceOf(CacheExpiredError);
  });

  test('should not throw if the custom expiry has not been reached yet', async () => {
    mockFs({
      [CACHE_PATH]: mockFs.file({
        content: JSON.stringify('Some test data'),
        mtime: subHours(new Date(), 36), // 36 hours ago
      }),
    });

    const cache = getCache<string>(CACHE_KEY, 48 * 60);
    await expect(cache.read()).resolves.toEqual('Some test data');
  });
});

describe(getFileSystemWriter, () => {
  const persist = getFileSystemWriter('2018/2019');

  test('should return empty array if this is first scrape', async () => {
    await expect(persist.getModuleCodes()).resolves.toEqual([]);
  });

  test('should allow module data to be deleted', async () => {
    // Write some module data, then delete it and check that all files have been deleted
    await Promise.all([
      persist.module('CS1010S', {} as any),
      persist.semesterData(1, 'CS1010S', {} as any),
      persist.semesterData(2, 'CS1010S', {} as any),
      persist.timetable(1, 'CS1010S', {} as any),
      persist.timetable(2, 'CS1010S', {} as any),
    ]);

    await persist.deleteModule('CS1010S');

    await expect(fs.pathExists('2018-2019/modules/CS1010S.json')).resolves.toEqual(false);
    await expect(fs.pathExists('2018-2019/semesters/1/CS1010S')).resolves.toEqual(false);
    await expect(fs.pathExists('2018-2019/semesters/2/CS1010S')).resolves.toEqual(false);
  });

  test('should return a list of all modules that exists', async () => {
    // Add some modules, then check that getModuleCodes() return them when requested
    await Promise.all([
      persist.module('CS1010S', {} as any),
      persist.module('CS1010X', {} as any),
      persist.module('CS3216', {} as any),
    ]);

    await expect(persist.getModuleCodes()).resolves.toEqual(['CS1010S', 'CS1010X', 'CS3216']);

    await persist.deleteModule('CS1010S');

    await expect(persist.getModuleCodes()).resolves.toEqual(['CS1010X', 'CS3216']);
  });
});
