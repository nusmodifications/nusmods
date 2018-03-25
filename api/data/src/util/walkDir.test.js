import path from 'path';
import fs from 'fs-extra';
import { walkJsonDir, walkJsonDirCallback, walkJsonDirSync } from './walkDir';

jest.mock('fs-extra');

const mockFileSystem = {
  app: {
    api: {
      '2016-2017': {
        '0': {
          'modules.json': '["test0"]',
        },
        '1': {
          'modules.json': '["test1"]',
        },
      },
      '2017-2018': {
        'modules.json': '["test2"]',
      },
    },
  },
};
fs.setMock(mockFileSystem);

describe(walkJsonDir, () => {
  it('walks the api directory for relevant files', async () => {
    const expected = {
      '2016-2017': {
        '0': ['test0'],
        '1': ['test1'],
      },
    };
    const apiPath = path.join('app', 'api');
    expect(await walkJsonDir(apiPath, 'modules.json', 2)).toEqual(expected);
  });
});

describe(walkJsonDirCallback, () => {
  it('walks to depth', async () => {
    const apiPath = path.join('app', 'api');
    const pathFilter = jest.fn().mockReturnValue(true);
    const dataCallback = jest.fn();

    await walkJsonDirCallback(apiPath, 'modules.json', 2, pathFilter, dataCallback);

    expect(pathFilter).toHaveBeenCalledTimes(3);
    expect(dataCallback).toHaveBeenCalledTimes(2); // 2017-2018 will have null content
    expect(dataCallback).toHaveBeenCalledWith(
      ['test0'],
      path.join(apiPath, '2016-2017', '0', 'modules.json'),
    );
    expect(dataCallback).toHaveBeenCalledWith(
      ['test1'],
      path.join(apiPath, '2016-2017', '1', 'modules.json'),
    );
  });

  it('skips directories', async () => {
    const apiPath = path.join('app', 'api');
    const pathFilter = jest
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValue(true);
    const dataCallback = jest.fn();

    await walkJsonDirCallback(apiPath, 'modules.json', 1, pathFilter, dataCallback);

    expect(pathFilter).toHaveBeenCalledTimes(Object.keys(mockFileSystem.app.api).length);
    expect(dataCallback).toHaveBeenCalledTimes(1);
    expect(dataCallback).toHaveBeenCalledWith(
      ['test2'],
      path.join(apiPath, '2017-2018', 'modules.json'),
    );
  });
});

describe(walkJsonDirSync, () => {
  it('walks the api directory for relevant files', async () => {
    const expected = {
      '2017-2018': ['test2'],
    };
    const apiPath = path.join('app', 'api');
    expect(walkJsonDirSync(apiPath, 'modules.json')).toEqual(expected);
  });
});
