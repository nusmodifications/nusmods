// @flow

import cs1010s from '__mocks__/modules/CS1010S.json';
import cs3216 from '__mocks__/modules/CS3216.json';
import LevelFilter from './LevelFilter';

test('test should filter modules according to their level', () => {
  const levelOne = new LevelFilter(1);
  const levelThree = new LevelFilter(3);
  const levelFour = new LevelFilter(4);

  expect(levelOne.test(cs1010s)).toBe(true);
  expect(levelThree.test(cs1010s)).toBe(false);
  expect(levelFour.test(cs1010s)).toBe(false);

  expect(levelOne.test(cs3216)).toBe(false);
  expect(levelThree.test(cs3216)).toBe(true);
  expect(levelFour.test(cs3216)).toBe(false);
});
