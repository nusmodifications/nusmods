import nock from 'nock';
import fs from 'fs-extra';
import HttpService, { getCacheFilePath, getFileModifiedTime } from './HttpService';

jest.mock('../../config.js', () => ({
  defaults: {
    cachePath: 'testBase',
    maxCacheAge: 0,
  },
}));

describe('getCacheFilePath', () => {
  const getFilePath = (url, params) => getCacheFilePath({ url, params });

  it('should output root to domain with index.html', () => {
    expect(getFilePath('https://www.example.com')).toBe('testBase/example.com/index.html');
    expect(getFilePath('https://www.example.com/test')).toBe('testBase/example.com/test/index.html');
  });

  it('should normalize url', () => {
    const expectedOutput = 'testBase/example.com/index.html';
    expect(getFilePath('https://www.example.com')).toBe(expectedOutput);
    expect(getFilePath('https://www.example.com:80')).toBe(expectedOutput);
    expect(getFilePath('http://www.example.com')).toBe(expectedOutput);
    expect(getFilePath('http://example.com/')).toBe(expectedOutput);
    expect(getFilePath('http://example.com/index.html')).toBe(expectedOutput);
    expect(getFilePath('http://www.example.com/#context')).toBe(expectedOutput);

    expect(getFilePath('http://example.com/', 'a=1&b=2'))
      .toBe(getFilePath('http://example.com/', 'b=2&a=1'));
    expect(getFilePath('http://example.com/?a=1', 'b=2'))
      .toBe(getFilePath('http://example.com/?b=2', 'a=1'));
  });

  it('should output queries to file savable format', () => {
    expect(getFilePath('https://www.example.com/', 'query="test"&x="test"'))
      .toBe('testBase/example.com/query=test&x=test');
    expect(getFilePath('https://www.example.com/', 'query=123'))
      .toBe('testBase/example.com/query=123');
    expect(getFilePath('https://www.example.com/', '<te>'))
      .toBe('testBase/example.com/te=');
  });

  it('should split subpaths to many different subfolders', () => {
    expect(getFilePath('https://www.example.com/test/', 'query="test"'))
      .toBe('testBase/example.com/test/query=test');
    expect(getFilePath('https://www.example.com/1/2/', 'query=123&x=5'))
      .toBe('testBase/example.com/1/2/query=123&x=5');
    expect(getFilePath('https://www.example.com/1/2/hex'))
      .toBe('testBase/example.com/1/2/hex/index.html');
  });

  it('should throw when there is no valid filename', () => {
    expect(() => getFilePath('')).toThrow();
  });
});

describe('getFileModifiedTime', () => {
  const mockFileSystemMeta = {
    testFile: {
      isFile: () => true,
      mtime: 0,
    },
    testFolder: {
      isFile: () => false,
      mtime: 0,
    },
  };

  beforeAll(() => {
    fs.setMock({}, mockFileSystemMeta);
  });

  it('should output the modified time of a file', async () => {
    expect(await getFileModifiedTime('testFile')).toBe(mockFileSystemMeta.testFile.mtime);
  });

  it('should output null if it is not a file', async () => {
    expect(await getFileModifiedTime('testFolder')).toBe(null);
  });

  it('should output null if no file', async () => {
    expect(await getFileModifiedTime('testNoFile')).toBe(null);
  });
});

describe('HttpService', () => {
  const HOST = 'http://example.com';
  const EPOCH = new Date(0);
  const cachedData = 'cached test';
  const freshData = 'no cached test';
  const mockFileSystem = {
    'testBase/example.com/index.html': cachedData,
  };
  let mockFileSystemMeta;

  beforeEach(() => {
    mockFileSystemMeta = {
      'testBase/example.com/index.html': {
        isFile: () => true,
        // Default should not be cached
        // since file is 40+ years old
        mtime: EPOCH,
      },
    };
    fs.setMock(mockFileSystem, mockFileSystemMeta);
    nock(HOST).get(/.*/).reply(200, freshData);
  });

  afterAll(() => {
    nock.cleanAll();
  });

  describe('nock server', () => {
    it('should return mock reponse', async () => {
      const response = await HttpService.get(HOST);
      expect(response.data).toBe(freshData);
    });
  });

  describe('requestInterceptor', () => {
    it('should intercept and return cache file if it exists', async () => {
      mockFileSystemMeta['testBase/example.com/index.html'].mtime = Date.now() + 1000;
      fs.setMock(mockFileSystem, mockFileSystemMeta);
      const response = await HttpService.get(HOST);
      expect(response.data).toBe(cachedData);
      expect(response.config.isCached).toBeTruthy();
    });

    it('should not intercept if cache file has expired', async () => {
      const response = await HttpService.get(HOST);
      expect(response.data).toBe(freshData);
      expect(response.config.isCached).toBeFalsy();
    });

    it('should not intercept if cache file does not exist', async () => {
      const response = await HttpService.get(`${HOST}/noCached`);
      expect(response.data).toBe(freshData);
      expect(response.config.isCached).toBeFalsy();
    });

    it('should set if-modified-since if cache file has expired', async () => {
      const response = await HttpService.get(`${HOST}`);
      expect(response.config.headers['if-modified-since']).toBe(EPOCH.toUTCString());
    });
  });

  describe('responseInterceptor', () => {
    beforeEach(() => {
      fs.outputFile = jest.fn();
    });

    it('should cache file if it is not already cached', async () => {
      await HttpService.get(HOST);
      expect(fs.outputFile).toBeCalled();
    });

    it('should not cache file if it is already cached', async () => {
      mockFileSystemMeta['testBase/example.com/index.html'].mtime = Date.now() + 1000;
      fs.setMock(mockFileSystem, mockFileSystemMeta);
      await HttpService.get(HOST);
      expect(fs.outputFile).not.toBeCalled();
    });

    it('should send cached file if server returns 304', async () => {
      nock.cleanAll();
      nock(HOST).get(/.*/).reply(304);
      const response = await HttpService.get(HOST);
      expect(fs.outputFile).not.toBeCalled();
      expect(response.data).toBe(cachedData);
    });
  });
});
