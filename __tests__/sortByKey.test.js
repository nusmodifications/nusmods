import sortByKey from '../utils/sortByKey';

describe('sortByKey', () => {
  it('sorts object in ascending order', () => {
    expect(sortByKey({ b: 1, a: 1 })).toEqual({ a: 1, b: 1 });
  });
});
