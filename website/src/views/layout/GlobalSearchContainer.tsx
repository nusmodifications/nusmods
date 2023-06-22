import type { ModuleCondensed } from 'types/modules';
import type { Venue } from 'types/venues';
import type { State } from 'types/state';

import { FC, memo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import useMediaQuery from 'views/hooks/useMediaQuery';
import GlobalSearch from 'views/layout/GlobalSearch';
import { modulePage, venuePage } from 'views/routes/paths';

import { ResultType, SearchResult, VENUE_RESULT } from 'types/views';
import { fetchVenueList } from 'actions/venueBank';
import { createSearchPredicate, regexify, sortModules, tokenize } from 'utils/moduleSearch';
import { breakpointUp } from 'utils/css';
import { takeUntil } from 'utils/array';

const RESULTS_LIMIT = 10;
const LONG_LIST_LIMIT = 70;
const MIN_INPUT_LENGTH = 2;

const GlobalSearchContainer: FC = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchVenueList());
  }, [dispatch]);

  const history = useHistory();
  const onSelectModule = useCallback(
    (module: ModuleCondensed) => {
      history.push(modulePage(module.moduleCode, module.title));
    },
    [history],
  );

  const onSelectVenue = useCallback(
    (venue: Venue) => {
      history.push(venuePage(venue));
    },
    [history],
  );

  const onSearch = useCallback(
    (type: ResultType, query: string) => {
      // TODO: Move this into a proper function
      const path = type === VENUE_RESULT ? '/venues' : '/courses';
      history.push(`${path}?q=${encodeURIComponent(query)}`);
    },
    [history],
  );

  const moduleList = useSelector(({ moduleBank }: State) => moduleBank.moduleList);
  const venueList = useSelector(({ venueBank }: State) => venueBank.venueList);

  const getResults = useCallback(
    (inputValue: string | null): SearchResult | null => {
      if (!inputValue || inputValue.length < MIN_INPUT_LENGTH) {
        return null;
      }

      const tokens = tokenize(inputValue);

      // Filter venues
      const regex = regexify(inputValue);
      const venues = takeUntil(venueList, LONG_LIST_LIMIT, (venue) => regex.test(venue));

      // Filter modules
      const predicate = createSearchPredicate(inputValue);
      const filteredModules = takeUntil(moduleList, LONG_LIST_LIMIT, (module) =>
        predicate({ ...module }),
      );
      const modules = sortModules(inputValue, filteredModules.slice());

      // There's only one type of result - use the long list format
      if (!modules.length || !venues.length) {
        return {
          modules: modules.slice(0, LONG_LIST_LIMIT),
          venues: venues.slice(0, LONG_LIST_LIMIT),
          tokens,
        };
      }

      // Plenty of modules and venues, show 6 modules, 4 venues
      if (modules.length >= 6 && venues.length >= 4) {
        return { modules: modules.slice(0, 6), venues: venues.slice(0, 4), tokens };
      }

      // Either there are few modules, few venues, or both.
      // If venues exist, show as many of them as possible as they are rare
      return { modules: modules.slice(0, RESULTS_LIMIT - venues.length), venues, tokens };
    },
    [moduleList, venueList],
  );

  const matchedBreakpoint = useMediaQuery(breakpointUp('md'));

  if (!matchedBreakpoint) return null;
  return (
    <GlobalSearch
      getResults={getResults}
      onSelectModule={onSelectModule}
      onSelectVenue={onSelectVenue}
      onSearch={onSearch}
    />
  );
};

export default memo(GlobalSearchContainer);
