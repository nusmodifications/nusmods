import moduleList from '__mocks__/modules';
import { createSearchFilter, sortModules } from './moduleSearch';

test('it searches by module prefix', () => {
  const filter = createSearchFilter('CS').initFilters(moduleList);
  const filtered = [...filter.filteredModules()];
  expect(filtered).toEqual(['CS1010S', 'CS3216']);
});

test('it searches by module code', () => {
  const filter = createSearchFilter('10').initFilters(moduleList);
  const filtered = [...filter.filteredModules()];
  expect(filtered).toEqual(['BFS1001', 'CS1010S']);
});

test('it searches by module title', () => {
  const filter = createSearchFilter('Managerial').initFilters(moduleList);
  const filtered = [...filter.filteredModules()];
  expect(filtered).toEqual(['ACC2002']);
});

test('it searches by module description, if available', () => {
  const filter = createSearchFilter('concepts').initFilters(moduleList);
  const filtered = [...filter.filteredModules()];
  expect(filtered).toEqual(['ACC2002', 'CS1010S']);
});

test('it searches multiword terms', () => {
  const filter = createSearchFilter('coding,  testing ').initFilters(moduleList);
  const filtered = [...filter.filteredModules()];
  expect(filtered).toEqual(['CS1010S']);
});

test('it sorts by prefering module prefix', () => {
  const modules = sortModules('cs', moduleList).map(m => m.ModuleCode);
  expect(modules).toEqual(['CS1010S', 'CS3216', 'ACC2002', 'BFS1001', 'PC1222']);
});

test('it sorts by prefering module code', () => {
  const modules = sortModules('10', moduleList).map(m => m.ModuleCode);
  expect(modules).toEqual(['BFS1001', 'CS1010S', 'ACC2002', 'CS3216', 'PC1222']);
});

test('it sorts by prefering title second', () => {
  const modules = sortModules('managerial', moduleList).map(m => m.ModuleCode);
  expect(modules).toEqual(['ACC2002', 'BFS1001', 'CS1010S', 'CS3216', 'PC1222']);
});
