// @flow

import FilterGroup from 'utils/filters/FilterGroup';
import ModuleFilter from 'utils/filters/ModuleFilter';

// The query string key used for the search term eg. ?q=Search+Term
const SEARCH_QUERY_KEY = 'q';

export default function searchFilter(searchTerm: string): FilterGroup<ModuleFilter> {
  const term = searchTerm.trim();
  const filter = new ModuleFilter(term, term, (module) => {
    const normalizedTerm = searchTerm.toLowerCase();

    if (module.ModuleTitle.toLowerCase().includes(normalizedTerm)) {
      return true;
    }

    if (module.ModuleDescription) {
      return module.ModuleDescription.toLowerCase().includes(normalizedTerm);
    }

    return false;
  });

  return new FilterGroup(SEARCH_QUERY_KEY, 'Search', [filter]).toggle(filter);
}
