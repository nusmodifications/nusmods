// @flow
import { sortBy } from 'lodash';
import FilterGroup from 'utils/filters/FilterGroup';
import ModuleFilter from 'utils/filters/ModuleFilter';
import type { ModuleCode, ModuleTitle, SearchableModule } from 'types/modules';

// The query string key used for the search term eg. ?q=Search+Term
export const SEARCH_QUERY_KEY = 'q';

export function tokenize(str: string): string[] {
  return str.trim().split(/\W+/g);
}

// Match only start of words, case insensitively
export function regexify(str: string): RegExp {
  const terms = str.trim().replace(/\W+/g, '\\W+');
  return RegExp(`\\b${terms}`, 'i');
}

export function createSearchPredicate(searchTerm: string): (SearchableModule) => boolean {
  const searchRegexes = tokenize(searchTerm).map(regexify);

  return function predicate(module: SearchableModule): boolean {
    return searchRegexes.every((regex) => {
      if (
        regex.test(module.ModuleCode) ||
        regex.test(module.ModuleTitle) ||
        regex.test(module.ModuleCode.replace(/\D+/, ''))
      ) {
        return true;
      }

      if (module.ModuleDescription) {
        return regex.test(module.ModuleDescription);
      }

      return false;
    });
  };
}

export function createSearchFilter(searchTerm: string): FilterGroup<ModuleFilter> {
  const predicate = createSearchPredicate(searchTerm);
  const filter = new ModuleFilter(encodeURIComponent(searchTerm), searchTerm, predicate);
  return new FilterGroup(SEARCH_QUERY_KEY, 'Search', [filter]).toggle(filter, !!searchTerm);
}

export function sortModules<T: { +ModuleCode: ModuleCode, +ModuleTitle: ModuleTitle }>(
  searchTerm: string,
  modules: T[],
): T[] {
  const searchRegexes = tokenize(searchTerm).map(regexify);

  return sortBy(modules, (module) => {
    let sum = 0;
    for (let i = 0; i < searchRegexes.length; i++) {
      if (
        searchRegexes[i].test(module.ModuleCode) ||
        searchRegexes[i].test(module.ModuleCode.replace(/\D+/, ''))
      ) {
        sum += 1;
      } else if (searchRegexes[i].test(module.ModuleTitle)) {
        sum += 2;
      } else {
        sum += 3;
      }
    }

    return sum;
  });
}
