import { Module } from 'types/modules';

import { createModule } from 'test-utils/filterHelpers';
import Group from './FilterGroup';
import Filter from './ModuleFilter';

const cs1010s = createModule('CS1010S');
const cs3216 = createModule('CS3216');
const pc1222 = createModule('PC1222');

// Call toggle on multiple filters together
function enable(group: Group<any>, ids: string[]): Group<any> {
  return ids.reduce((g, id) => g.toggle(id), group);
}

function initModules(groups: Group<any>[], modules: Module[]) {
  groups.forEach((group) => group.initFilters(modules));
}

function moduleCodeFilter(str: string): Filter {
  return new Filter(str, str, (module) => module.moduleCode.includes(str));
}

const f1 = new Filter('f1', 'f1', () => false);
const f2 = new Filter('f2', 'f2', () => false);

describe('#isActive()', () => {
  test('should return true if any test is enabled', () => {
    const group = new Group('test group', 'test group', [f1, f2]);

    expect(group.isActive()).toBe(false);
    expect(enable(group, ['f1']).isActive()).toBe(true);
    expect(enable(group, ['f1', 'f1']).isActive()).toBe(false);
  });
});

describe('#toggle()', () => {
  test('should toggle filter immutably', () => {
    const group = new Group('test group', 'test group', [f1]);

    expect(group.toggle('f1').filters.f1.enabled).toBe(true);
    expect(group.filters.f1.enabled).toBe(false);
    expect(group.toggle('f1')).not.toBe(group);
  });

  test('should toggle filters between enabled and disabled', () => {
    const group = new Group('test group', 'test group', [f1]);
    expect(group.toggle('f1').toggle('f1').filters.f1.enabled).toBe(false);
  });

  test('should set filters to state in second parameter', () => {
    const group = new Group('test group', 'test group', [f1]);
    expect(group.toggle('f1', false).filters.f1.enabled).toBe(false);
    expect(group.toggle('f1').toggle('f1', false).filters.f1.enabled).toBe(false);
  });

  test('should accept filter objects as the first parameter', () => {
    const group = new Group('g', 'g', [f1]);
    expect(group.toggle(f1).filters.f1.enabled).toBe(true);
  });
});

describe('.union()', () => {
  const modules = [cs1010s, cs3216, pc1222];

  test('should return null if no group has active filters', () => {
    const g1 = new Group('g1', 'g1', [f1]);
    const g2 = new Group('g2', 'g2', [f2]);
    initModules([g1, g2], modules);

    expect(Group.union([g1, g2])).toBeNull();
    expect(Group.union([g1.toggle('f1'), g2], g1)).toBeNull();
  });

  test('should return a union of the ModuleCodes of modules that tested true', () => {
    const g1 = new Group('g1', 'g1', [moduleCodeFilter('CS')]);
    const g2 = new Group('g2', 'g2', [moduleCodeFilter('1'), moduleCodeFilter('2')]);
    initModules([g1, g2], [cs1010s, cs3216, pc1222]);

    expect(Group.union([g1.toggle('CS'), g2])).toEqual(new Set(['CS1010S', 'CS3216']));

    expect(Group.union([g1.toggle('CS'), g2.toggle('2')])).toEqual(new Set(['CS3216']));

    expect(Group.union([g1.toggle('CS'), g2.toggle('1').toggle('2')])).toEqual(
      new Set(['CS1010S', 'CS3216']),
    );
  });
});

describe('.apply()', () => {
  test('should return list of modules as is if no filters are enabled', () => {
    const g1 = new Group('g1', 'g1', [f1]);
    const g2 = new Group('g2', 'g2', [f2]);
    initModules([g1, g2], [cs1010s, cs3216]);

    expect(Group.apply([cs1010s, cs3216], [g1, g2])).toEqual([cs1010s, cs3216]);
  });

  test('should return list of modules that fulfill all groups', () => {
    const g1 = new Group('g1', 'g1', [moduleCodeFilter('2')]);
    const g2 = new Group('g2', 'g2', [moduleCodeFilter('3')]);
    initModules([g1, g2], [cs1010s, cs3216, pc1222]);

    expect(Group.apply([cs1010s, pc1222, cs3216], [g1.toggle('2'), g2])).toEqual([pc1222, cs3216]);

    expect(Group.apply([cs1010s, pc1222, cs3216], [g1.toggle('2'), g2.toggle('3')])).toEqual([
      cs3216,
    ]);
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
  function filterIds(group: Group<any>): string[] {
    return group.activeFilters.map((filter) => filter.id);
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

describe('#reset()', () => {
  test('should disable all enabled filters', () => {
    const group = new Group('test group', 'test group', [f1, f2]);

    expect(group.reset().isActive()).toBe(false);
    expect(
      enable(group, ['f1'])
        .reset()
        .isActive(),
    ).toBe(false);
    expect(
      enable(group, ['f1', 'f2'])
        .reset()
        .isActive(),
    ).toBe(false);
  });
});
