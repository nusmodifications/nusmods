import { difference, intersection, union } from './set';
import { s } from './test-utils';

describe(union, () => {
  test('should return a read-only union of the provided sets', () => {
    expect(union()).toEqual(s());
    expect(union(s(1, 2, 3))).toEqual(s(1, 2, 3));
    expect(union(s(1), s(2))).toEqual(s(1, 2));
    expect(union(s(1), s(2, 3, 4))).toEqual(s(1, 2, 3, 4));
    expect(union(s(1), s(2, 3, 4), s(5), s(6))).toEqual(s(1, 2, 3, 4, 5, 6));
  });
});

describe(intersection, () => {
  test('should return an intersection of the provided sets', () => {
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
});

describe(difference, () => {
  test('should return all elements of a without any element from b', () => {
    expect(difference(s(), s())).toEqual(s());
    expect(difference(s(), s(1, 2, 3))).toEqual(s());
    expect(difference(s(1, 2, 3), s())).toEqual(s(1, 2, 3));
    expect(difference(s(1, 2, 3), s(1))).toEqual(s(2, 3));
    expect(difference(s(1, 2, 3), s(1))).toEqual(s(2, 3));
    expect(difference(s(1, 2, 3), s(1, 2, 3))).toEqual(s());
    expect(difference(s(1, 2, 3), s(1, 2, 3, 4, 5))).toEqual(s());
  });
});
