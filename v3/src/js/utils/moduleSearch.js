// @flow

import { sortBy, sum } from 'lodash';
import FilterGroup from 'utils/filters/FilterGroup';
import ModuleFilter from 'utils/filters/ModuleFilter';
import type { Module } from 'types/modules';

// The query string key used for the search term eg. ?q=Search+Term
export const SEARCH_QUERY_KEY = 'q';

export function tokenize(str: string): string[] {
  return str.trim().split(/[\s,.]+/g);
}

export function createSearchFilter(searchTerm: string): FilterGroup<ModuleFilter> {
  const normalizedTerm = tokenize(searchTerm.toUpperCase());

  const filter = new ModuleFilter(searchTerm, searchTerm, (module) => {
    return normalizedTerm.every((term) => {
      if (module.ModuleCode.includes(term) || module.ModuleTitle.toUpperCase().includes(term)) {
        return true;
      }

      if (module.ModuleDescription) {
        return module.ModuleDescription.toUpperCase().includes(term);
      }

      return false;
    });
  });

  return new FilterGroup(SEARCH_QUERY_KEY, 'Search', [filter]).toggle(filter);
}

export function sortModules(searchTerm: string, modules: Module[]): Module[] {
  const normalizedTerm = tokenize(searchTerm.toUpperCase());

  return sortBy(modules, module => sum(normalizedTerm.map((term) => {
    if (module.ModuleCode.includes(term)) return 1;
    if (module.ModuleTitle.toUpperCase().includes(term)) return 2;
    return 3;
  })));
}
