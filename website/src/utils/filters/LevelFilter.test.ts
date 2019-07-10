import { CS1010S, CS3216 } from '__mocks__/modules';
import LevelFilter from './LevelFilter';

test('test should filter modules according to their level', () => {
  const levelOne = new LevelFilter(1);
  const levelThree = new LevelFilter(3);
  const levelFour = new LevelFilter(4);

  expect(levelOne.test(CS1010S)).toBe(true);
  expect(levelThree.test(CS1010S)).toBe(false);
  expect(levelFour.test(CS1010S)).toBe(false);

  expect(levelOne.test(CS3216)).toBe(false);
  expect(levelThree.test(CS3216)).toBe(true);
  expect(levelFour.test(CS3216)).toBe(false);
});
