// @flow

/** @var {Module} */
import cs1010s from '__mocks__/modules/CS1010S.json';
/** @var {Module} */
import cs3216 from '__mocks__/modules/CS3216.json';
/** @var {Module} */
import pc1222 from '__mocks__/modules/PC1222.json';

import FilterGroup from './FilterGroup';
import ModuleFilter from './ModuleFilter';

describe('#isActive()', () => {
  test('should return true if any test is enabled', () => {
    const group = new FilterGroup('test group', [
      new ModuleFilter('f1', () => true),
      new ModuleFilter('f2', () => true),
    ]);

    expect(group.isActive()).toBe(false);
    expect(group.toggle('f1').isActive()).toBe(true);
    expect(group.toggle('f1').toggle('f1').isActive()).toBe(false);
  });
});

describe('#filter()', () => {
  test('should toggle filter immutably', () => {
    const group = new FilterGroup('test group', [new ModuleFilter('f1', () => false)]);

    expect(group.toggle('f1').filters.f1.enabled).toBe(true);
    expect(group.filters.f1.enabled).toBe(false);
    expect(group.toggle('f1')).not.toBe(group);
  });

  test('should toggle filters between enabled and disabled', () => {
    const group = new FilterGroup('test group', [new ModuleFilter('f1', () => false)]);
    expect(group.toggle('f1').toggle('f1').filters.f1.enabled).toBe(false);
  });
});

describe('#test()', () => {
  test('should return true if all tests are disabled', () => {
    const group = new FilterGroup('test group', [
      new ModuleFilter('f1', () => false),
      new ModuleFilter('f2', () => false),
    ]);

    expect(group.test(cs1010s)).toBe(true);
  });

  test('should return true if any tests return true', () => {
    const group = new FilterGroup('test group', [
      new ModuleFilter('f1', () => true),
      new ModuleFilter('f2', () => true),
      new ModuleFilter('f3', () => false),
      new ModuleFilter('f4', () => false),
    ]);

    expect(group.toggle('f1').toggle('f2').test(cs1010s)).toBe(true);
    expect(group.toggle('f1').toggle('f3').test(cs1010s)).toBe(true);
    expect(group.toggle('f3').test(cs1010s)).toBe(false);
    expect(group.toggle('f3').toggle('f4').test(cs1010s)).toBe(false);
  });
});

describe('.apply()', () => {
  test('should return list of modules as is if no filters are enabled', () => {
    const g1 = new FilterGroup('g1', [new ModuleFilter('f1', () => false)]);
    const g2 = new FilterGroup('g2', [new ModuleFilter('f2', () => false)]);

    expect(FilterGroup.apply([cs1010s, cs3216], [g1, g2])).toHaveLength(2);
  });

  test('should return list of modules that fulfill all groups', () => {
    const g1 = new FilterGroup('g1', [new ModuleFilter('contains 2', module => module.ModuleCode.includes('2'))]);
    const g2 = new FilterGroup('g2', [new ModuleFilter('contains 3', module => module.ModuleCode.includes('3'))]);

    expect(FilterGroup.apply(
      [cs1010s, pc1222, cs3216],
      [g1.toggle('contains 2'), g2],
    )).toEqual([pc1222, cs3216]);

    expect(FilterGroup.apply(
      [cs1010s, pc1222, cs3216],
      [g1.toggle('contains 2'), g2.toggle('contains 3')],
    )).toEqual([cs3216]);
  });
});
