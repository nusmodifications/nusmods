// @flow

import FilterGroup from 'utils/filters/FilterGroup';
import ModuleFilter from 'utils/filters/ModuleFilter';

// The query string key used for the search term eg. ?q=Search+Term
export const SEARCH_QUERY_KEY = 'q';

export function tokenize(str: string): string[] {
  return str.trim().split(/[\s,.]+/g);
}

export default function searchFilter(searchTerm: string): FilterGroup<ModuleFilter> {
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
