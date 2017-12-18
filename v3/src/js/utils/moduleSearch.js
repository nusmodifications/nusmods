// @flow

import { sortBy } from 'lodash';
import FilterGroup from 'utils/filters/FilterGroup';
import ModuleFilter from 'utils/filters/ModuleFilter';
import type { Module } from 'types/modules';

// The query string key used for the search term eg. ?q=Search+Term
export const SEARCH_QUERY_KEY = 'q';

export function tokenize(str: string): string[] {
  return str.trim().split(/[\s,.]+/g);
}

// Match only start of words, case insensitively
export function regexify(str: string): RegExp {
  const terms = str.split(/[^\w]+/g).filter(Boolean);
  return RegExp(`\\b${terms.join('|')}`, 'i');
}

export function createSearchFilter(searchTerm: string): FilterGroup<ModuleFilter> {
  const searchRegex = regexify(searchTerm);

  const filter = new ModuleFilter(searchTerm, searchTerm, (module) => {
    if (
      searchRegex.test(module.ModuleCode) ||
      searchRegex.test(module.ModuleTitle) ||
      searchRegex.test(module.ModuleCode.replace(/\D+/, ''))
    ) {
      return true;
    }

    if (module.ModuleDescription) {
      return searchRegex.test(module.ModuleDescription);
    }
    return false;
  });

  return new FilterGroup(SEARCH_QUERY_KEY, 'Search', [filter]).toggle(filter);
}

export function sortModules(searchTerm: string, modules: Module[]): Module[] {
  const searchRegex = regexify(searchTerm);

  return sortBy(modules, (module) => {
    if (searchRegex.test(module.ModuleCode) || searchRegex.test(module.ModuleCode.replace(/\D+/, ''))) {
      return 1;
    }
    if (searchRegex.test(module.ModuleTitle)) {
      return 2;
    }
    return 3;
  });
}
