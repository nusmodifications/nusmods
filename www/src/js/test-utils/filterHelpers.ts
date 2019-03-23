import { Module } from 'types/modules';
import FilterGroup from 'utils/filters/FilterGroup';
import Filter from 'utils/filters/ModuleFilter';
import { ModuleCode } from '../types/moduleBaseTypes';

export function createModule(code: ModuleCode): Module {
  return {
    moduleCode: code,
    title: 'Test Module',
    semesterData: [],
    department: 'Test Department',
    faculty: 'Test',
    moduleCredit: '4',
    acadYear: '16/17',
  };
}

export function createGroup(modules: Module[] = []) {
  return new FilterGroup('test', 'test', [
    new Filter('a', 'a', () => true),
    new Filter('b', 'b', () => true),
  ]).initFilters(modules);
}
