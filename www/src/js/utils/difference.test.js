// @flow
import { difference, undoDifference, redoDifference } from './difference';

const base = {
  changed: 'ARRAYSSTARTAT1',
  arr: [1, 2],
  untouched: 'untouched',
  deleted: 'deleted',
  deep: {
    obj: {
      one: 'two', // Changed
      unchanged: 'unchanged',
      deleted: 'deleted',
    },
  },
  unchangedObj: {
    twinkle: 'twinkle',
  },
};

const object = {
  changed: 'ARRAYSSTARTAT0', // Changed
  arr: [0, 1], // One elem removed, one added
  untouched: 'untouched',
  added: 'added',
  deep: {
    obj: {
      one: 'buckle', // Changed
      unchanged: 'unchanged',
      added: 'added',
    },
  },
  unchangedObj: {
    twinkle: 'twinkle',
  },
};

describe('#difference()', () => {
  test('should compute all deleted, added and changed object key paths', () => {
    const diff = difference(base, object);
    expect(diff).toMatchSnapshot();
  });
});

describe('#undoDifference()', () => {
  test('should undo all differences', () => {
    const diff = difference(base, object);
    const generatedBase = undoDifference(object, diff);
    expect(generatedBase).toEqual(base);
  });
});

describe('#redoDifference()', () => {
  test('should redo all differences', () => {
    const diff = difference(base, object);
    const generatedObject = redoDifference(base, diff);
    expect(generatedObject).toEqual(object);
  });
});
