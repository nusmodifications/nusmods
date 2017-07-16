import path from 'path';
import fs from 'fs-extra';
import { walkJsonDir, walkJsonDirSync } from '../server/util/walkDir';

jest.mock('fs-extra');

describe('walkJsonDir', () => {
  it('walks the api directory for relevant files', async () => {
    const mockFileSystem = {
      app: {
        api: {
          '2016-2017': {
            'modules.json': '["test"]',
          },
          '2017-2018': {
            'modules.json': '["test1"]',
          },
        },
      },
    };
    fs.setMock(mockFileSystem);
    const expected = {
      '2016-2017': ['test'],
      '2017-2018': ['test1'],
    };
    const apiPath = path.join('app', 'api');
    expect(await walkJsonDir(apiPath, 'modules.json')).toEqual(expected);
  });
});

describe('walkJsonDirSync', () => {
  it('walks the api directory for relevant files', async () => {
    const mockFileSystem = {
      app: {
        api: {
          '2016-2017': {
            'modules.json': '["test"]',
          },
          '2017-2018': {
            'modules.json': '["test1"]',
          },
        },
      },
    };
    fs.setMock(mockFileSystem);
    const expected = {
      '2016-2017': ['test'],
      '2017-2018': ['test1'],
    };
    const apiPath = path.join('app', 'api');
    expect(walkJsonDirSync(apiPath, 'modules.json')).toEqual(expected);
  });
});
