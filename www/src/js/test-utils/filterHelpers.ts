import { Module, ModuleCode } from 'types/modules';
import FilterGroup from 'utils/filters/FilterGroup';
import Filter from 'utils/filters/ModuleFilter';

export function createModule(code: ModuleCode): Module {
  return {
    ModuleCode: code,
    ModuleTitle: 'Test Module',
    History: [],
    Types: [],
    Department: 'Test Department',
    ModuleCredit: '4',
    AcadYear: '16/17',
    ModmavenTree: { name: 'Test Module', children: [] },
  };
}

export function createGroup(modules: Module[] = []) {
  return new FilterGroup('test', 'test', [
    new Filter('a', 'a', () => true),
    new Filter('b', 'b', () => true),
  ]).initFilters(modules);
}
