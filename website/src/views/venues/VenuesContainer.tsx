import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import Loadable, { LoadingComponentProps } from 'react-loadable';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Location, locationsAreEqual } from 'history';
import classnames from 'classnames';
import axios from 'axios';
import qs from 'query-string';
import { isEqual, mapValues, noop, pick, size } from 'lodash';

import type { TimePeriod, Venue, VenueDetailList, VenueSearchOptions } from 'types/venues';
import type { Subtract } from 'types/utils';

import deferComponentRender from 'views/hocs/deferComponentRender';
import ApiError from 'views/errors/ApiError';
import Warning from 'views/errors/Warning';
import LoadingSpinner from 'views/components/LoadingSpinner';
import SearchBox from 'views/components/SearchBox';
import { Clock, Map } from 'react-feather';
import { venuePage } from 'views/routes/paths';
import Modal from 'views/components/Modal';
import Title from 'views/components/Title';
import NoFooter from 'views/layout/NoFooter';
import MapContext from 'views/components/map/MapContext';
import useMediaQuery from 'views/hooks/useMediaQuery';

import config from 'config';
import nusmods from 'apis/nusmods';
import HistoryDebouncer from 'utils/HistoryDebouncer';
import { clampClassDuration, filterAvailability, searchVenue, sortVenues } from 'utils/venues';
import { breakpointDown } from 'utils/css';
import { convertIndexToTime } from 'utils/timify';

import AvailabilitySearch, { defaultSearchOptions } from './AvailabilitySearch';
import VenueList from './VenueList';
import VenueDetails from './VenueDetails';
import VenueLocation from './VenueLocation';
import styles from './VenuesContainer.scss';

export type Params = {
  q: string;
  venue: string;
};

const SecondaryPaneComponent: FC<{
  highlightPeriod?: TimePeriod;
  matchedVenues: VenueDetailList;
  selectedVenue?: string;
  venues: VenueDetailList;
}> = ({ highlightPeriod, matchedVenues, selectedVenue, venues }) => {
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const history = useHistory();
  const onClearVenueSelect = useCallback(
    () =>
      history.push({
        ...history.location,
        pathname: venuePage(),
      }),
    [history],
  );

  const matchBreakpoint = useMediaQuery(breakpointDown('sm'));

  const venueDetailProps = useMemo(() => {
    if (!venues || !selectedVenue) return null;

    // Find the index of the current venue on the list of matched venues so
    // we can obtain the previous and next item
    const lowercaseSelectedVenue = selectedVenue.toLowerCase();
    const venueIndex = matchedVenues.findIndex(
      ([venue]) => venue.toLowerCase() === lowercaseSelectedVenue,
    );

    // The selected item may not be in the list of matched venues (if the user
    // changed their search options afterwards), in which case we look for it in all
    // venues
    if (venueIndex === -1) {
      const venueDetail = venues.find(([venue]) => venue.toLowerCase() === lowercaseSelectedVenue);
      if (!venueDetail) return null;
      const [venue, availability] = venueDetail;
      return { venue, availability, next: undefined, previous: undefined };
    }

    const [venue, availability] = matchedVenues[venueIndex];
    const [previous] = matchedVenues[venueIndex - 1] || ([] as string[]);
    const [next] = matchedVenues[venueIndex + 1] || ([] as string[]);
    return { venue, availability, next, previous };
  }, [matchedVenues, selectedVenue, venues]);

  function renderSelectedVenue() {
    if (!venueDetailProps) {
      return null;
    }
    return <VenueDetails {...venueDetailProps} highlightPeriod={highlightPeriod} />;
  }

  return (
    <MapContext.Provider value={{ toggleMapExpanded: setIsMapExpanded }}>
      {matchBreakpoint ? (
        <Modal
          isOpen={selectedVenue != null}
          onRequestClose={onClearVenueSelect}
          className={styles.venueDetailModal}
          fullscreen
        >
          <button
            type="button"
            className={classnames('btn btn-outline-primary btn-block', styles.closeButton)}
            onClick={onClearVenueSelect}
          >
            Back to Venues
          </button>
          {renderSelectedVenue()}
        </Modal>
      ) : (
        <>
          <div
            className={classnames(styles.venueDetail, {
              [styles.mapExpanded]: isMapExpanded,
            })}
          >
            {selectedVenue == null ? (
              <div className={styles.noVenueSelected}>
                <Map />
                <p>Select a venue on the left to see its timetable</p>
              </div>
            ) : (
              renderSelectedVenue()
            )}
          </div>
          <NoFooter />
        </>
      )}
    </MapContext.Provider>
  );
};
const SecondaryPane = memo(SecondaryPaneComponent);

type LoadedProps = { venues: VenueDetailList };
type Props = LoadedProps;

export const VenuesContainerComponent: FC<Props> = ({ venues }) => {
  const history = useHistory();
  const debouncedHistory = useMemo(() => new HistoryDebouncer(history), [history]);
  const location = useLocation();
  const matchParams = useParams<Params>();

  // Search state
  const [
    /** Value of the controlled search box; updated real-time */
    searchQuery,
    setSearchQuery,
  ] = useState<string>(() => qs.parse(location.search).q || '');
  /** Actual string to search with; deferred update */
  const deferredSearchQuery = searchQuery; // TODO: Redundant now. Use React.useDeferredValue after we adopt concurrent mode
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

  // TODO: Check if this actually does anything useful
  useEffect(() => {
    VenueLocation.preload();
  }, []);

  const onFindFreeRoomsClicked = useCallback(() => {
    batchedUpdates(() => {
      setIsAvailabilityEnabled(!isAvailabilityEnabled);
      if (pristineSearchOptions && !isAvailabilityEnabled) {
        // Only reset search options if the user has never changed it, and if the
        // search box is being opened. By resetting the option when the box is opened,
        // the time when the box is opened will be used, instead of the time when the
        // page is loaded
        setSearchOptions(defaultSearchOptions());
      }
    });
  }, [isAvailabilityEnabled, pristineSearchOptions]);

  const onAvailabilityUpdate = useCallback(
    (newSearchOptions: VenueSearchOptions) => {
      if (!isEqual(newSearchOptions, searchOptions)) {
        batchedUpdates(() => {
          setSearchOptions(clampClassDuration(newSearchOptions));
          setPristineSearchOptions(false); // user changed searchOptions
        });
      }
    },
    [searchOptions],
  );

  const highlightPeriod = useMemo<TimePeriod | undefined>(() => {
    if (!isAvailabilityEnabled) return undefined;

    return {
      day: searchOptions.day,
      startTime: convertIndexToTime(searchOptions.time * 2),
      endTime: convertIndexToTime(2 * (searchOptions.time + searchOptions.duration)),
    };
  }, [isAvailabilityEnabled, searchOptions.day, searchOptions.duration, searchOptions.time]);

  const selectedVenue = useMemo<Venue | undefined>(
    () => (matchParams.venue ? decodeURIComponent(matchParams.venue) : undefined),
    [matchParams.venue],
  );

  // Sync URL with component state
  useEffect(() => {
    let query: Partial<Params> = {};
    if (deferredSearchQuery) query.q = deferredSearchQuery;
    if (isAvailabilityEnabled) query = { ...query, ...searchOptions };
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
    deferredSearchQuery,
    history,
    isAvailabilityEnabled,
    searchOptions,
    selectedVenue,
  ]);

  const matchedVenues = useMemo(() => {
    const matched = searchVenue(venues, deferredSearchQuery);
    return isAvailabilityEnabled ? filterAvailability(matched, searchOptions) : matched;
  }, [isAvailabilityEnabled, searchOptions, deferredSearchQuery, venues]);
  const matchedVenueNames = useMemo(() => matchedVenues.map(([venue]) => venue), [matchedVenues]);

  function renderSearch() {
    return (
      <div className={styles.venueSearch}>
        <h3>Venue Search</h3>

        <SearchBox
          className={styles.searchBox}
          throttle={0}
          useInstantSearch
          isLoading={false}
          value={searchQuery}
          placeholder="e.g. LT27"
          onChange={setSearchQuery}
          onSearch={noop}
        />

        <button
          className={classnames(
            'btn btn-block btn-svg',
            styles.availabilityToggle,
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

        {size(matchedVenues) === 0 ? (
          renderNoResult()
        ) : (
          <VenueList venues={matchedVenueNames} selectedVenue={selectedVenue} />
        )}
      </div>

      <SecondaryPane
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
