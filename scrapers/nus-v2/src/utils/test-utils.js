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

/**
 * Check the two objects have the same properties
 */
export function expectSameKeys<T: Object>(actual: T, expected: T) {
  expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort())
}
