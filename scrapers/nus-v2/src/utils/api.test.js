// @flow

import { fromTermCode, getTermCode } from './api';

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
