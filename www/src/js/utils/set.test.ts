// @flow
import { intersection, intersectionCount, union } from './set';

function s<T>(...args: T[]): Set<T> {
  return new Set(args);
}

test('partitionUnion() should return a read-only union of the provided sets', () => {
  expect(union()).toEqual(s());
  expect(union(s(1, 2, 3))).toEqual(s(1, 2, 3));
  expect(union(s(1), s(2))).toEqual(s(1, 2));
  expect(union(s(1), s(2, 3, 4))).toEqual(s(1, 2, 3, 4));
  expect(union(s(1), s(2, 3, 4), s(5), s(6))).toEqual(s(1, 2, 3, 4, 5, 6));
});

test('intersection() should return an intersection of the provided sets', () => {
  expect(intersection()).toEqual(s());

  expect(intersection(s(1, 2, 3))).toEqual(s(1, 2, 3));

  expect(intersection(s(), s())).toEqual(s());
  expect(intersection(s(), s(1))).toEqual(s());
  expect(intersection(s(1, 2, 3), s(4, 5, 6))).toEqual(s());
  expect(intersection(s(1, 2, 3, 4), s(4, 5, 6))).toEqual(s(4));
  expect(intersection(s(4, 5, 6), s(4, 5, 6))).toEqual(s(4, 5, 6));

  expect(intersection(s(4), s(5), s(6))).toEqual(s());
  expect(intersection(s(), s(4, 5, 6), s(4, 6))).toEqual(s());
  expect(intersection(s(4), s(4, 5, 6), s(4, 6))).toEqual(s(4));
  expect(intersection(s(4), s(4, 5, 6), s(4, 6), s(4, 7, 8))).toEqual(s(4));
  expect(intersection(s(1, 2, 3, 4), s(3, 4, 5, 6), s(3, 4, 7, 8, 9))).toEqual(s(3, 4));
});

test('intersectionCount() should count the number of intersecting items', () => {
  expect(intersectionCount(s(), s())).toBe(0);
  expect(intersectionCount(s(), s(1))).toBe(0);
  expect(intersectionCount(s(1), s(1))).toBe(1);
  expect(intersectionCount(s(1, 2, 3, 4), s(2, 3, 4, 5))).toBe(3);
});
