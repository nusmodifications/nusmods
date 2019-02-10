// @flow
import { range, stubTrue, stubFalse } from 'lodash';
import { firstNonNull, intersperse, takeUntil } from './array';

test('intersperse should return array mixed with delimiter', () => {
  expect(intersperse([], 0)).toEqual([]);
  expect(intersperse([1], 0)).toEqual([1]);

  expect(intersperse([1, 2], 0)).toEqual([1, 0, 2]);
  expect(intersperse([1, 2, 3, 4], 0)).toEqual([1, 0, 2, 0, 3, 0, 4]);
  expect(intersperse(['a', 'b', 'c'], 0)).toEqual(['a', 0, 'b', 0, 'c']);
});

test('takeUntil should only return results until max length is reached', () => {
  expect(takeUntil(range(20), 30, stubTrue)).toEqual(range(20));
  expect(takeUntil(range(20), 10, stubTrue)).toEqual(range(10));
  expect(takeUntil(range(20), 0, stubTrue)).toEqual([]);
});

test('takeUntil should return items filtered by the predicate', () => {
  expect(takeUntil(range(20), 20, stubFalse)).toEqual([]);
  expect(takeUntil(range(20), 20, (i) => i % 2 === 0)).toEqual(range(0, 20, 2));
  expect(takeUntil(range(20), 5, (i) => i % 2 === 0)).toEqual(range(0, 10, 2));
});

describe(firstNonNull, () => {
  test('should return first non-null value produced', () => {
    expect(firstNonNull([() => 0])).toEqual(0);
    expect(firstNonNull([() => ''])).toEqual('');
    expect(firstNonNull([() => false, () => true])).toEqual(false);
    expect(firstNonNull([() => true, () => false])).toEqual(true);
    expect(firstNonNull([() => null, () => undefined])).toBeNull();
  });
});
