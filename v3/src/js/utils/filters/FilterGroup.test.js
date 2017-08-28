// @flow

/** @var {Module} */
import cs1010s from '__mocks__/modules/CS1010S.json';
/** @var {Module} */
import cs3216 from '__mocks__/modules/CS3216.json';
/** @var {Module} */
import pc1222 from '__mocks__/modules/PC1222.json';

import Group from './FilterGroup';
import Filter from './ModuleFilter';

// Call toggle on multiple filters together
function enable(group: Group<*>, ids: string[]): Group<*> {
  return ids.reduce((g, id) => g.toggle(id), group);
}

describe('#isActive()', () => {
  test('should return true if any test is enabled', () => {
    const group = new Group('test group', 'test group', [
      new Filter('f1', 'f1', () => true),
      new Filter('f2', 'f2', () => true),
    ]);

    expect(group.isActive()).toBe(false);
    expect(enable(group, ['f1']).isActive()).toBe(true);
    expect(enable(group, ['f1', 'f1']).isActive()).toBe(false);
  });
});

describe('#toggle()', () => {
  test('should toggle filter immutably', () => {
    const group = new Group('test group', 'test group', [new Filter('f1', 'f1', () => false)]);

    expect(group.toggle('f1').filters.f1.enabled).toBe(true);
    expect(group.filters.f1.enabled).toBe(false);
    expect(group.toggle('f1')).not.toBe(group);
  });

  test('should toggle filters between enabled and disabled', () => {
    const group = new Group('test group', 'test group', [new Filter('f1', 'f1', () => false)]);
    expect(group.toggle('f1').toggle('f1').filters.f1.enabled).toBe(false);
  });

  test('should set filters to state in second parameter', () => {
    const group = new Group('test group', 'test group', [new Filter('f1', 'f1', () => false)]);
    expect((group.toggle('f1', false)).filters.f1.enabled).toBe(false);
    expect((group.toggle('f1').toggle('f1', false)).filters.f1.enabled).toBe(false);
  });

  test('should accept filter objects as the first parameter', () => {
    const filter = new Filter('f1', 'f1', () => false);
    const group = new Group('g', 'g', [filter]);
    expect(group.toggle(filter).filters.f1.enabled).toBe(true);
  });
});

describe('#test()', () => {
  test('should return true if all tests are disabled', () => {
    const group = new Group('test group', 'test group', [
      new Filter('f1', 'f1', () => false),
      new Filter('f2', 'f2', () => false),
    ]);

    expect(group.test(cs1010s)).toBe(true);
  });

  test('should return true if any tests return true', () => {
    const group = new Group('test group', 'test group', [
      new Filter('f1', 'f1', () => true),
      new Filter('f2', 'f2', () => true),
      new Filter('f3', 'f3', () => false),
      new Filter('f4', 'f4', () => false),
    ]);

    expect(enable(group, ['f1', 'f2']).test(cs1010s)).toBe(true);
    expect(enable(group, ['f1', 'f3']).test(cs1010s)).toBe(true);
    expect(enable(group, ['f3']).test(cs1010s)).toBe(false);
    expect(enable(group, ['f3', 'f4']).test(cs1010s)).toBe(false);
  });
});

describe('.apply()', () => {
  test('should return list of modules as is if no filters are enabled', () => {
    const g1 = new Group('g1', 'g1', [new Filter('f1', 'f1', () => false)]);
    const g2 = new Group('g2', 'g2', [new Filter('f2', 'f2', () => false)]);

    expect(Group.apply([cs1010s, cs3216], [g1, g2])).toHaveLength(2);
  });

  test('should return list of modules that fulfill all groups', () => {
    const g1 = new Group('g1', 'g1', [new Filter('contains 2', 'contains 2', module => module.ModuleCode.includes('2'))]);
    const g2 = new Group('g2', 'g2', [new Filter('contains 3', 'contains 3', module => module.ModuleCode.includes('3'))]);

    expect(Group.apply(
      [cs1010s, pc1222, cs3216],
      [g1.toggle('contains 2'), g2],
    )).toEqual([pc1222, cs3216]);

    expect(Group.apply(
      [cs1010s, pc1222, cs3216],
      [g1.toggle('contains 2'), g2.toggle('contains 3')],
    )).toEqual([cs3216]);
  });
});

describe('#toQueryString()', () => {
  test('should convert enabled filters to query string', () => {
    // Label != id to ensure only ID is used for query string
    const group = new Group('g', 'group', [
      new Filter('a', 'label 1', () => false),
      new Filter('b', 'label 2', () => false),
      new Filter('c', 'label 3', () => false),
    ]);

    expect(enable(group, []).toQueryString()).toEqual('');
    expect(enable(group, ['a']).toQueryString()).toEqual('a');
    expect(enable(group, ['a', 'b']).toQueryString()).toEqual('a,b');
  });
});

describe('#fromQueryString()', () => {
  function filterIds(group: Group<*>): string[] {
    return group.activeFilters.map(filter => filter.id);
  }

  test('should enable filters based on query string', () => {
    const group = new Group('g', 'group', [
      new Filter('a', 'label 1', () => false),
      new Filter('b', 'label 2', () => false),
      new Filter('c', 'label 3', () => false),
    ]);

    expect(filterIds(group.fromQueryString(''))).toEqual([]);
    expect(filterIds(group.fromQueryString('a'))).toEqual(['a']);
    expect(filterIds(group.fromQueryString('a,b'))).toEqual(['a', 'b']);
    expect(filterIds(group.fromQueryString('a,b,c'))).toEqual(['a', 'b', 'c']);
  });

  test('should disable filters based on query string', () => {
    const group = new Group('g', 'group', [
      new Filter('a', 'label 1', () => false),
      new Filter('b', 'label 2', () => false),
      new Filter('c', 'label 3', () => false),
    ]);

    expect(filterIds(enable(group, ['a']).fromQueryString('a'))).toEqual(['a']);
    expect(filterIds(enable(group, ['a']).fromQueryString('b'))).toEqual(['b']);
    expect(filterIds(enable(group, ['a', 'b', 'c']).fromQueryString('a,b'))).toEqual(['a', 'b']);
  });

  test('should ignore ids that do not exist', () => {
    const group = new Group('g', 'group', [new Filter('a', 'label 1', () => false)]);

    expect(filterIds(group.fromQueryString('d'))).toEqual([]);
  });
});
