import { cacheDownload, fromTermCode, getTermCode, retry, containsNbsps } from './api';
import { mockCache } from './test-utils';

describe(getTermCode, () => {
  test('should return term code', () => {
    expect(getTermCode(1, '2018/2019')).toEqual('1810');
    expect(getTermCode('2', '2018/2019')).toEqual('1820');
    expect(getTermCode('2', '2018/19')).toEqual('1820');
  });
});

describe(fromTermCode, () => {
  test('should return acad year and semester', () => {
    expect(fromTermCode('1810')).toEqual(['2018/2019', 1]);
    expect(fromTermCode('1820')).toEqual(['2018/2019', 2]);
    expect(fromTermCode('1830')).toEqual(['2018/2019', 3]);
    expect(fromTermCode('2020')).toEqual(['2020/2021', 2]);
  });
});

describe(cacheDownload, () => {
  test('should return and save to cache if download is successful', async () => {
    const download = jest.fn().mockResolvedValue('My data');
    const cache = mockCache('File content');

    const result = await cacheDownload('data', download, cache);
    expect(result).toEqual('My data');
    expect(cache.write).toBeCalledWith('My data');
    expect(cache.read).not.toBeCalled();
  });

  test('should not throw if cache save is unsuccessful', async () => {
    const download = jest.fn().mockResolvedValue('My data');
    const cache = mockCache('File content');
    cache.write.mockRejectedValue(new Error('The server is full of eels'));

    const result = await cacheDownload('data', download, cache);
    expect(result).toEqual('My data');
    expect(cache.read).not.toBeCalled();
  });

  test('should try to read from cache if download is not successful', async () => {
    const download = jest.fn().mockRejectedValue(new Error('The API server is on fire'));
    const cache = mockCache('File content');

    const result = await cacheDownload('data', download, cache);
    expect(result).toEqual('File content');
    expect(cache.write).not.toBeCalled();
  });

  test('should throw download error if reading from cache was also unsuccessful', async () => {
    const downloadError = new Error('The API server is on fire');
    const download = jest.fn().mockRejectedValue(downloadError);
    const cache = mockCache('File content');
    cache.read.mockRejectedValue(new Error('The file system is also on fire'));

    await expect(cacheDownload('data', download, cache)).rejects.toEqual(downloadError);
  });
});

describe(retry, () => {
  test('it should return the resolved value', async () => {
    const fn = jest.fn().mockResolvedValue('Hello world');
    await expect(retry(fn, 3)).resolves.toEqual('Hello world');
    expect(fn).toBeCalledTimes(1);
  });

  test('it should retry the function until it succeeds', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Oh no bees'))
      .mockResolvedValue('Hello world');

    const result = await retry(fn, 3);
    expect(result).toEqual('Hello world');
    expect(fn).toBeCalledTimes(2);
  });

  test('it should retry the function until it runs out of tries', async () => {
    const error = new Error('Oh no bees');
    const fn = jest.fn().mockRejectedValue(error);
    expect.assertions(2);

    try {
      await retry(fn, 3);
    } catch (e) {
      expect(e).toEqual(error);
    }

    expect(fn).toBeCalledTimes(3);
  });

  test('it should not retry if condition returns false', async () => {
    const error = new Error('Oh no bees');
    const fn = jest.fn().mockRejectedValue(error);
    expect.assertions(2);

    try {
      await retry(fn, 3, () => false);
    } catch (e) {
      expect(e).toEqual(error);
    }

    expect(fn).toBeCalledTimes(1);
  });
});

describe(containsNbsps, () => {
  test('should return true on triple consecutive Nbsp', () => {
    const nbsp = String.fromCharCode(160);
    expect(containsNbsps(`a${nbsp}b${nbsp}c${nbsp}a`)).toBe(true);
    expect(containsNbsps(`a${nbsp}b${nbsp}c${nbsp}d${nbsp}a`)).toBe(true);

    expect(containsNbsps(`a${nbsp}b ${nbsp}c${nbsp}a`)).toBe(false);
    expect(containsNbsps(`a${nbsp}a`)).toBe(false);
    expect(containsNbsps('')).toBe(false);
  });
});
