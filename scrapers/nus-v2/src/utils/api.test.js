// @flow

import { getTermCode } from './api';

describe(getTermCode, () => {
  test('should return term code', () => {
    expect(getTermCode(1, '2018/2019')).toEqual('1810');
    expect(getTermCode('2', '2018/2019')).toEqual('1820');
    expect(getTermCode('2', '2018/19')).toEqual('1820');
  });
});
