// @flow

import { removeEmptyValues, titleize, trimValues } from './data';

describe(titleize, () => {
  test('should turn all upper and lowercase text into proper titles', () => {
    expect(titleize('hello world 2019')).toEqual('Hello World 2019');
    expect(titleize('HELLO WORLD 2019')).toEqual('Hello World 2019');
  });

  test('should not titlecase minor words', () => {
    expect(titleize('The ring of mordor')).toEqual('The Ring of Mordor');
  });

  test('should not change abbreviations and minor words in the middle of words', () => {
    expect(titleize('GRADUATE SEMINAR MODULE IN BIOLOGICAL SCIENCES')).toEqual(
      'Graduate Seminar Module in Biological Sciences',
    );
    expect(titleize('Quantum and Theoretical Physics')).toEqual('Quantum and Theoretical Physics');
  });

  test('should not change abbreviations', () => {
    expect(titleize('NUS world cup 2019')).toEqual('NUS World Cup 2019');
    expect(titleize('NUS-MIT lab for excellence 2019')).toEqual('NUS-MIT Lab For Excellence 2019');
  });
});

describe(trimValues, () => {
  test('should remove whitespace around the given values', () => {
    expect(
      trimValues(
        {
          a: '\u00A0\u202Fc\t\n',
          b: 123,
          c: 'def',
          d: null,
        },
        ['a', 'b', 'c', 'd'],
      ),
    ).toEqual({
      a: 'c',
      b: 123,
      c: 'def',
      d: null,
    });
  });

  test('should not remove whitespace for keys not given', () => {
    expect(
      trimValues(
        {
          a: ' a ',
          b: ' b ',
          c: ' c ',
        },
        ['a', 'b'],
      ),
    ).toEqual({
      a: 'a',
      b: 'b',
      c: ' c ',
    });
  });
});

describe(removeEmptyValues, () => {
  test('it should remove null and empty strings', () => {
    expect(
      removeEmptyValues(
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
      removeEmptyValues(
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
      removeEmptyValues(
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
