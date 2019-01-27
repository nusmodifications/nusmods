// @flow

import type { File } from '../components/fs';
import { cacheDownload, fromTermCode, getTermCode } from './api';

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
  function makeMockFile(fileContent: string = ''): File<string> {
    return {
      path: './fake',
      write: jest.fn().mockResolvedValue(),
      read: jest.fn().mockResolvedValue(fileContent),
    };
  }

  test('should return and save to cache if download is successful', async () => {
    const download = jest.fn().mockResolvedValue('My data');
    const cache = makeMockFile('File content');

    const result = await cacheDownload('data', download, cache);
    expect(result).toEqual('My data');
    expect(cache.write).toBeCalledWith('My data');
    expect(cache.read).not.toBeCalled();
  });

  test('should not throw if cache save is unsuccessful', async () => {
    const download = jest.fn().mockResolvedValue('My data');
    const cache = makeMockFile('File content');
    cache.write.mockRejectedValue(new Error('The server is full of eels'));

    const result = await cacheDownload('data', download, cache);
    expect(result).toEqual('My data');
    expect(cache.read).not.toBeCalled();
  });

  test('should try to read from cache if download is not successful', async () => {
    const download = jest.fn().mockRejectedValue(new Error('The API server is on fire'));
    const cache = makeMockFile('File content');

    const result = await cacheDownload('data', download, cache);
    expect(result).toEqual('File content');
    expect(cache.write).not.toBeCalled();
  });
});
