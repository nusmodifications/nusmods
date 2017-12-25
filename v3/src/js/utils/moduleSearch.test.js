// @flow
import type { ModuleCode } from 'types/modules';
import moduleList from '__mocks__/modules';

import { createSearchFilter, sortModules } from './moduleSearch';

function testSearchTerm(term: string, expectedModules: ModuleCode[]) {
  const filter = createSearchFilter(term).initFilters(moduleList);
  expect(filter.filteredModules())
    .toEqual(new Set(expectedModules));
}

test('searches by module prefix', () => {
  testSearchTerm('CS', ['CS1010S', 'CS3216']);
});

test('searches by module code', () => {
  testSearchTerm('10', ['BFS1001', 'CS1010S', 'GES1021']);
});

test('searches by module title', () => {
  testSearchTerm('Managerial', ['ACC2002']);
});

test('searches by module description, if available', () => {
  testSearchTerm('concepts', ['ACC2002', 'CS1010S']);
});

test('searches multiword terms', () => {
  testSearchTerm('coding,  testing', ['CS1010S']);
});

test('searches get more specific with more keywords', () => {
  testSearchTerm('fund problem', ['CS1010S']);
  testSearchTerm('prod eng', ['CS3216']);
});

test('sorts by preferring module prefix', () => {
  const [first, second] = sortModules('cs', moduleList).map(m => m.ModuleCode);
  expect([first, second]).toEqual(['CS1010S', 'CS3216']);
});

test('sorts by preferring module code', () => {
  const [one, two, three] = sortModules('10', moduleList).map(m => m.ModuleCode);
  expect([one, two, three]).toEqual(['BFS1001', 'CS1010S', 'GES1021']);
});

test('sorts by preferring title second', () => {
  const [first] = sortModules('managerial', moduleList).map(m => m.ModuleCode);
  expect(first).toBe('ACC2002');
});
