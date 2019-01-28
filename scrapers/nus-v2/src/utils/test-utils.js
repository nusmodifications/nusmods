// @flow

/* eslint-env jest */

import type { Cache } from '../services/output';

/* eslint-disable import/prefer-default-export */

export function mockCache<T>(fileContent: T): Cache<T> {
  return {
    path: './fake',
    write: jest.fn().mockResolvedValue(),
    read: jest.fn().mockResolvedValue(fileContent),
  };
}
