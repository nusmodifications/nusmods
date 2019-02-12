import { createModule } from 'test-utils/filterHelpers';

import Filter from './ModuleFilter';

describe('count()', () => {
  const modules = ['CS1010S', 'CS1231', 'GET1025', 'GET1029'].map(createModule);

  test('should return the total number of matched modules if the modules param is null', () => {
    const filter = new Filter('test', 'test', (module) => module.ModuleCode.startsWith('CS'));
    filter.initCount(modules);

    expect(filter.count(null)).toEqual(2);
  });

  test('should return the number of matched modules intersecting the provided modules', () => {
    const filter = new Filter('test', 'test', (module) => module.ModuleCode.startsWith('CS'));
    filter.initCount(modules);

    expect(filter.count(new Set([]))).toEqual(0);
    expect(filter.count(new Set(['GET1025']))).toEqual(0);
    expect(filter.count(new Set(['GET1025', 'GET1029']))).toEqual(0);
    expect(filter.count(new Set(['CS1010S']))).toEqual(1);
    expect(filter.count(new Set(['CS1010S', 'CS1231']))).toEqual(2);
  });
});
