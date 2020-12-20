import {
  FC,
  unstable_useDeferredValue as useDeferredValue,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import Loadable, { LoadingComponentProps } from 'react-loadable';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Location, locationsAreEqual } from 'history';
import classnames from 'classnames';
import axios from 'axios';
import qs from 'query-string';
import { isEqual, mapValues, pick, size } from 'lodash';

import type { TimePeriod, Venue, VenueDetailList, VenueSearchOptions } from 'types/venues';
import type { Subtract } from 'types/utils';

import deferComponentRender from 'views/hocs/deferComponentRender';
import ApiError from 'views/errors/ApiError';
import Warning from 'views/errors/Warning';
import LoadingOverlay from 'views/components/LoadingOverlay';
import LoadingSpinner from 'views/components/LoadingSpinner';
import SearchBox from 'views/components/SearchBox';
import { Clock } from 'react-feather';
import { venuePage } from 'views/routes/paths';
import Title from 'views/components/Title';

import config from 'config';
import nusmods from 'apis/nusmods';
import HistoryDebouncer from 'utils/HistoryDebouncer';
import { clampClassDuration, filterAvailability, searchVenue, sortVenues } from 'utils/venues';
import { convertIndexToTime } from 'utils/timify';

import AvailabilitySearch, { defaultSearchOptions } from './AvailabilitySearch';
import VenueDetailsPane from './VenueDetailsPane';
import VenueList from './VenueList';
import VenueLocation from './VenueLocation';
import styles from './VenuesContainer.scss';

type Params = {
  q: string;
  venue: string;
};

type LoadedProps = { venues: VenueDetailList };
type Props = LoadedProps;

export const VenuesContainerComponent: FC<Props> = ({ venues }) => {
  const history = useHistory();
  const debouncedHistory = useMemo(() => new HistoryDebouncer(history), [history]);
  const location = useLocation();
  const matchParams = useParams<Params>();

  const [searchQuery, setSearchQuery] = useState<string>(() => qs.parse(location.search).q || '');

  const [isAvailabilityEnabled, setIsAvailabilityEnabled] = useState(() => {
    const params = qs.parse(location.search);
    return !!(params.time && params.day && params.duration);
  });

  const [searchOptions, setSearchOptions] = useState(() => {
    const params = qs.parse(location.search);
    // Extract searchOptions from the query string if they are present
    return isAvailabilityEnabled
      ? (mapValues(pick(params, ['time', 'day', 'duration']), (i) =>
          parseInt(i, 10),
        ) as VenueSearchOptions)
      : defaultSearchOptions();
  });
  const [pristineSearchOptions, setPristineSearchOptions] = useState(() => !isAvailabilityEnabled);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const deferredIsAvailabilityEnabled = useDeferredValue(isAvailabilityEnabled);
  const deferredSearchOptions = useDeferredValue(searchOptions);
  const isPending =
    searchQuery !== deferredSearchQuery ||
    isAvailabilityEnabled !== deferredIsAvailabilityEnabled ||
    searchOptions !== deferredSearchOptions;

  // TODO: Check if this actually does anything useful
  useEffect(() => {
    VenueLocation.preload();
  }, []);

  const onFindFreeRoomsClicked = useCallback(() => {
    setIsAvailabilityEnabled(!isAvailabilityEnabled);
    if (pristineSearchOptions && !isAvailabilityEnabled) {
      // Only reset search options if the user has never changed it, and if the
      // search box is being opened. By resetting the option when the box is
      // opened, the time when the box is opened will be used, instead of the
      // time when the page is loaded.
      setSearchOptions(defaultSearchOptions());
    }
  }, [isAvailabilityEnabled, pristineSearchOptions]);

  const onAvailabilityUpdate = useCallback(
    (newSearchOptions: VenueSearchOptions) => {
      if (!isEqual(newSearchOptions, searchOptions)) {
        setSearchOptions(clampClassDuration(newSearchOptions));
        setPristineSearchOptions(false); // user changed searchOptions
      }
    },
    [searchOptions],
  );

  const highlightPeriod = useMemo<TimePeriod | undefined>(() => {
    if (!deferredIsAvailabilityEnabled) return undefined;

    return {
      day: deferredSearchOptions.day,
      startTime: convertIndexToTime(deferredSearchOptions.time * 2),
      endTime: convertIndexToTime(
        2 * (deferredSearchOptions.time + deferredSearchOptions.duration),
      ),
    };
  }, [
    deferredIsAvailabilityEnabled,
    deferredSearchOptions.day,
    deferredSearchOptions.duration,
    deferredSearchOptions.time,
  ]);

  const selectedVenue = useMemo<Venue | undefined>(
    () => (matchParams.venue ? decodeURIComponent(matchParams.venue) : undefined),
    [matchParams.venue],
  );

  // Sync URL with component state
  useEffect(() => {
    let query: Partial<Params> = {};
    if (deferredSearchQuery) query.q = deferredSearchQuery;
    if (deferredIsAvailabilityEnabled) query = { ...query, ...deferredSearchOptions };
    const search = qs.stringify(query);

    const pathname = venuePage(selectedVenue);

    const proposedLocation: Location = {
      ...history.location,
      search,
      pathname,
    };

    if (!locationsAreEqual(history.location, proposedLocation)) {
      // TODO: Consider replacing our debounced history with
      // `React.useTransition` or a React scheduler low priority callback.
      debouncedHistory.push(proposedLocation);
    }
  }, [
    debouncedHistory,
    deferredIsAvailabilityEnabled,
    deferredSearchOptions,
    deferredSearchQuery,
    history,
    selectedVenue,
  ]);

  const matchedVenues = useMemo(() => {
    const matched = searchVenue(venues, deferredSearchQuery);
    return deferredIsAvailabilityEnabled
      ? filterAvailability(matched, deferredSearchOptions)
      : matched;
  }, [deferredIsAvailabilityEnabled, deferredSearchOptions, deferredSearchQuery, venues]);
  const matchedVenueNames = useMemo(() => matchedVenues.map(([venue]) => venue), [matchedVenues]);

  function renderSearch() {
    return (
      <div className={styles.venueSearch}>
        <h3>Venue Search</h3>

        <SearchBox
          className={styles.searchBox}
          value={searchQuery}
          placeholder="e.g. LT27"
          onChange={setSearchQuery}
        />

        <button
          className={classnames(
            'btn btn-block btn-svg',
            isAvailabilityEnabled ? 'btn-primary' : 'btn-outline-primary',
          )}
          onClick={onFindFreeRoomsClicked}
          type="button"
        >
          <Clock className="svg" /> Find free rooms
        </button>

        {isAvailabilityEnabled && (
          <div className={styles.availabilitySearch}>
            <AvailabilitySearch
              isEnabled={isAvailabilityEnabled}
              searchOptions={searchOptions}
              onUpdate={onAvailabilityUpdate}
            />
          </div>
        )}
      </div>
    );
  }

  const disableAvailability = useCallback(() => setIsAvailabilityEnabled(false), []);
  function renderNoResult() {
    const unfilteredCount = size(matchedVenues);
    return (
      <>
        <Warning message="No matching venues found" />
        {!!unfilteredCount && isAvailabilityEnabled && (
          <p className="text-center text-muted">
            {unfilteredCount === 1
              ? 'There is a venue that is not shown because it is not free'
              : `There are ${unfilteredCount} venues that are not shown because they are not free`}
            <br />
            <button type="button" className="btn btn-link" onClick={disableAvailability}>
              Show all rooms
            </button>
          </p>
        )}
      </>
    );
  }

  return (
    <div className={classnames('page-container', styles.pageContainer)}>
      <Title>Venues</Title>

      <div className={styles.venuesList}>
        {renderSearch()}

        <div className="position-relative">
          {isPending && (
            <LoadingOverlay deferred>
              <LoadingSpinner />
            </LoadingOverlay>
          )}
          {!isPending && size(matchedVenues) === 0 && renderNoResult()}
          <VenueList venues={matchedVenueNames} selectedVenue={selectedVenue} />
        </div>
      </div>

      <VenueDetailsPane
        highlightPeriod={highlightPeriod}
        matchedVenues={matchedVenues}
        selectedVenue={selectedVenue}
        venues={venues}
      />
    </div>
  );
};

const AsyncVenuesContainer = Loadable.Map<Subtract<Props, LoadedProps>, LoadedProps>({
  loader: {
    venues: async () => {
      const response = await axios.get(nusmods.venuesUrl(config.semester));
      return sortVenues(response.data);
    },
  },
  loading: (props: LoadingComponentProps) => {
    if (props.error) {
      return <ApiError dataName="venue information" retry={props.retry} />;
    }

    if (props.pastDelay) {
      return <LoadingSpinner />;
    }

    return null;
  },
  render({ venues }, props) {
    return <VenuesContainerComponent venues={venues} {...props} />;
  },
});

export default deferComponentRender(AsyncVenuesContainer);

export function preload() {
  AsyncVenuesContainer.preload();
  VenueLocation.preload();
}
