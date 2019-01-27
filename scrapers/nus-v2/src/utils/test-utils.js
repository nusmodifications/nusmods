// @flow

/* eslint-env jest */

import type { File } from '../services/fs';

/* eslint-disable import/prefer-default-export */

export function makeMockFile<T>(fileContent: T): File<T> {
  return {
    path: './fake',
    write: jest.fn().mockResolvedValue(),
    read: jest.fn().mockResolvedValue(fileContent),
  };
}
