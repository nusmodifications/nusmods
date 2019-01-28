// @flow

import { cleanObject, titleize } from './data';

describe(titleize, () => {
  test('should turn all upper and lowercase text into proper titles', () => {
    expect(titleize('hello world 2019')).toEqual('Hello World 2019');
    expect(titleize('HELLO WORLD 2019')).toEqual('Hello World 2019');
  });

  test('should not titlecase minor words', () => {
    expect(titleize('The ring of mordor')).toEqual('The Ring of Mordor');
  });

  test('should not change abbreviations', () => {
    expect(titleize('NUS world cup 2019')).toEqual('NUS World Cup 2019');
    expect(titleize('NUS-MIT lab for excellence 2019')).toEqual('NUS-MIT Lab For Excellence 2019');
  });
});

describe(cleanObject, () => {
  test('it should remove null and empty strings', () => {
    expect(
      cleanObject(
        {
          a: null,
          b: '',
          c: 0,
          d: '    ',
          e: 12,
          f: 'x',
        },
        ['a', 'b', 'c', 'd'],
      ),
    ).toEqual({
      e: 12,
      f: 'x',
    });
  });

  test('it should not remove keys that are not in keys', () => {
    expect(
      cleanObject(
        {
          a: null,
          b: '',
          c: 0,
          d: 12,
          e: 'x',
        },
        [],
      ),
    ).toEqual({
      a: null,
      b: '',
      c: 0,
      d: 12,
      e: 'x',
    });
  });

  test('it should remove nil strings', () => {
    expect(
      cleanObject(
        {
          a: 'nil',
          b: 'None.',
          c: '-n/a-',
          d: 'Hello',
          e: 'x',
          f: ' ',
        },
        ['a', 'b', 'c', 'd', 'e', 'f'],
      ),
    ).toEqual({ d: 'Hello', e: 'x' });
  });
});
