import { sortBy } from 'lodash';
import FilterGroup from 'utils/filters/FilterGroup';
import ModuleFilter from 'utils/filters/ModuleFilter';
import { ModuleCode, ModuleTitle, SearchableModule } from 'types/modules';

// The query string key used for the search term eg. q | null | undefined=Search+Term
export const SEARCH_QUERY_KEY = 'q';

export function tokenize(str: string): string[] {
  return str.trim().split(/\W+/g);
}

// Match only start of words, case insensitively
export function regexify(str: string): RegExp {
  const terms = str.trim().replace(/\W+/g, '\\W+');
  return RegExp(`\\b${terms}`, 'i');
}

export function createSearchPredicate(
  searchTerm: string,
): (searchableModule: SearchableModule) => boolean {
  const searchRegexes = tokenize(searchTerm).map(regexify);

  return function predicate(module: SearchableModule): boolean {
    return searchRegexes.every((regex) => {
      if (
        regex.test(module.moduleCode) ||
        regex.test(module.title) ||
        regex.test(module.moduleCode.replace(/\D+/, ''))
      ) {
        return true;
      }

      if (module.description) {
        return regex.test(module.description);
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

export function sortModules<
  T extends { readonly moduleCode: ModuleCode; readonly title: ModuleTitle }
>(searchTerm: string, modules: T[]): T[] {
  const searchRegexes = tokenize(searchTerm).map(regexify);

  return sortBy(modules, (module) => {
    let sum = 0;
    for (let i = 0; i < searchRegexes.length; i++) {
      if (
        searchRegexes[i].test(module.moduleCode) ||
        searchRegexes[i].test(module.moduleCode.replace(/\D+/, ''))
      ) {
        sum += 1;
      } else if (searchRegexes[i].test(module.title)) {
        sum += 2;
      } else {
        sum += 3;
      }
    }

    return sum;
  });
}
