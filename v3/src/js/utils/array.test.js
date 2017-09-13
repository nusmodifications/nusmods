// @flow
import { intersperse } from './array';

test('intersperse should return array mixed with delimiter', () => {
  expect(intersperse([], 0)).toEqual([]);
  expect(intersperse([1], 0)).toEqual([1]);

  expect(intersperse([1, 2], 0)).toEqual([1, 0, 2]);
  expect(intersperse([1, 2, 3, 4], 0)).toEqual([1, 0, 2, 0, 3, 0, 4]);
  expect(intersperse(['a', 'b', 'c'], 0)).toEqual(['a', 0, 'b', 0, 'c']);
});
