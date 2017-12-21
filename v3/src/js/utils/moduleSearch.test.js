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
  expect(filtered).toEqual(['BFS1001', 'CS1010S', 'GES1021']);
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

test('its searches get more specific with more keywords', () => {
  const filter = createSearchFilter('to by').initFilters(moduleList);
  const filtered = [...filter.filteredModules()];
  expect(filtered).toEqual([]);
});

test('it sorts by prefering module prefix', () => {
  const [first, second] = sortModules('cs', moduleList).map(m => m.ModuleCode);
  expect([first, second]).toEqual(['CS1010S', 'CS3216']);
});

test('it sorts by prefering module code', () => {
  const [one, two, three] = sortModules('10', moduleList).map(m => m.ModuleCode);
  expect([one, two, three]).toEqual(['BFS1001', 'CS1010S', 'GES1021']);
});

test('it sorts by prefering title second', () => {
  const [first] = sortModules('managerial', moduleList).map(m => m.ModuleCode);
  expect(first).toBe('ACC2002');
});
