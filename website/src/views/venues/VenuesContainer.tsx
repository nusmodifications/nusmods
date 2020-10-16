import * as React from 'react';
// eslint-disable-next-line camelcase
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import Loadable, { LoadingComponentProps } from 'react-loadable';
import classnames from 'classnames';
import axios, { AxiosResponse } from 'axios';
import qs from 'query-string';
import { isEqual, mapValues, pick, size } from 'lodash';

import type { TimePeriod, Venue, VenueDetailList, VenueSearchOptions } from 'types/venues';
import type { Subtract } from 'types/utils';
import type { WithBreakpoint } from 'views/hocs/makeResponsive';

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
import makeResponsive from 'views/hocs/makeResponsive';

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

type LoadedProps = { venues: VenueDetailList };
type Props = LoadedProps & WithBreakpoint;

const pageHead = <Title>Venues</Title>;

export const VenuesContainerComponent: React.FC<Props> = ({ matchBreakpoint, venues }) => {
  const history = useHistory();
  const location = useLocation();
  const matchParams = useParams();

  // View state
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Search state
  const [searchBoxValue, setSearchBoxValue] = useState(() => qs.parse(location.search).q || '');
  const searchTerm = searchBoxValue; // Redundant now, but this can be deferred to improve perf
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

  const historyDebouncer = useMemo(() => new HistoryDebouncer(history), [history]);

  useEffect(() => {
    VenueLocation.preload();
  }, []);

  const onFindFreeRoomsClicked = useCallback(() => {
    setIsAvailabilityEnabled(!isAvailabilityEnabled);
    if (pristineSearchOptions && !isAvailabilityEnabled) {
      // Only reset search options if the user has never changed it, and if the
      // search box is being opened. By resetting the option when the box is opened,
      // the time when the box is opened will be used, instead of the time when the
      // page is loaded
      setSearchOptions(defaultSearchOptions());
    }
  }, [isAvailabilityEnabled, pristineSearchOptions]);

  const onClearVenueSelect = useCallback(
    () =>
      history.push({
        ...history.location,
        pathname: venuePage(),
      }),
    [history],
  );

  const onSearchBoxChange = useCallback((value: string) => setSearchBoxValue(value), []);

  const onAvailabilityUpdate = useCallback(
    (newSearchOptions: VenueSearchOptions) => {
      if (!isEqual(newSearchOptions, searchOptions)) {
        setSearchOptions(clampClassDuration(newSearchOptions));
        setPristineSearchOptions(false); // user changed searchOptions
      }
    },
    [searchOptions],
  );

  const onToggleMapExpanded = useCallback((newIsMapExpanded: boolean) => {
    setIsMapExpanded(newIsMapExpanded);
  }, []);

  const highlightPeriod = useMemo<TimePeriod | undefined>(() => {
    if (!isAvailabilityEnabled) return undefined;

    return {
      day: searchOptions.day,
      startTime: convertIndexToTime(searchOptions.time * 2),
      endTime: convertIndexToTime(2 * (searchOptions.time + searchOptions.duration)),
    };
  }, [isAvailabilityEnabled, searchOptions.day, searchOptions.duration, searchOptions.time]);

  const selectedVenue = useMemo<Venue | null>(() => {
    const { venue } = matchParams;
    if (!venue) return null;
    return decodeURIComponent(venue);
  }, [matchParams]);

  const updateURL = useCallback(
    (debounce = true) => {
      let query: Partial<Params> = {};

      if (searchTerm) query.q = searchTerm;
      if (isAvailabilityEnabled) query = { ...query, ...searchOptions };

      const pathname = venuePage(selectedVenue);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const historyToUse = debounce ? historyDebouncer : history;
      const search = qs.stringify(query);
      if (history.location.search !== search || history.location.pathnname !== pathname) {
        // FIXME: This triggers some really slow updates
        // historyToUse.push({
        //   ...location,
        //   search,
        //   pathname,
        // });
      }
    },
    [history, historyDebouncer, isAvailabilityEnabled, searchOptions, searchTerm, selectedVenue],
  );

  // FIXME: Only update URLs when isAvailabilityEnabled, searchOptions,
  // searchTerm, or updateURL changed, not updateURL
  // useEffect(() => updateURL(false), [isAvailabilityEnabled, updateURL]);
  useEffect(() => updateURL(), [searchOptions, searchTerm, updateURL]);

  function renderSearch() {
    return (
      <div className={styles.venueSearch}>
        <h3>Venue Search</h3>

        <SearchBox
          className={styles.searchBox}
          throttle={0}
          useInstantSearch
          isLoading={false}
          value={searchBoxValue}
          placeholder="e.g. LT27"
          onChange={onSearchBoxChange}
          onSearch={() => {
            // noop
          }}
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

  function renderNoResult(unfilteredCount: number) {
    return (
      <>
        <Warning message="No matching venues found" />
        {!!unfilteredCount && isAvailabilityEnabled && (
          <p className="text-center text-muted">
            {unfilteredCount === 1
              ? 'There is a venue that is not shown because it is not free'
              : `There are ${unfilteredCount} venues that are not shown because they are not free`}
            <br />
            <button
              type="button"
              className="btn btn-link"
              onClick={() => setIsAvailabilityEnabled(false)}
            >
              Show all rooms
            </button>
          </p>
        )}
      </>
    );
  }

  function renderSelectedVenue(matchedVenues: VenueDetailList) {
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
      return (
        <VenueDetails venue={venue} availability={availability} highlightPeriod={highlightPeriod} />
      );
    }

    const [venue, availability] = matchedVenues[venueIndex];
    const [previous] = matchedVenues[venueIndex - 1] || ([] as string[]);
    const [next] = matchedVenues[venueIndex + 1] || ([] as string[]);

    return (
      <VenueDetails
        venue={venue}
        availability={availability}
        next={next}
        previous={previous}
        highlightPeriod={highlightPeriod}
      />
    );
  }

  let matchedVenues = searchVenue(venues, searchTerm);
  const unfilteredCount = size(matchedVenues);

  if (isAvailabilityEnabled) {
    matchedVenues = filterAvailability(matchedVenues, searchOptions);
  }

  return (
    <div className={classnames('page-container', styles.pageContainer)}>
      {pageHead}

      <div className={styles.venuesList}>
        {renderSearch()}

        {size(matchedVenues) === 0 ? (
          renderNoResult(unfilteredCount)
        ) : (
          <VenueList venues={matchedVenues.map(([venue]) => venue)} selectedVenue={selectedVenue} />
        )}
      </div>

      <MapContext.Provider value={{ toggleMapExpanded: onToggleMapExpanded }}>
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
            {renderSelectedVenue(matchedVenues)}
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
                renderSelectedVenue(matchedVenues)
              )}
            </div>
            <NoFooter />
          </>
        )}
      </MapContext.Provider>
    </div>
  );
};

// Explicitly declare top level components for React hot reloading to work.
const ResponsiveVenuesContainer = makeResponsive(VenuesContainerComponent, breakpointDown('sm'));
const AsyncVenuesContainer = Loadable.Map<Subtract<Props, LoadedProps>, { venues: AxiosResponse }>({
  loader: {
    venues: () => axios.get(nusmods.venuesUrl(config.semester)),
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
  render(loaded, props) {
    return <ResponsiveVenuesContainer venues={sortVenues(loaded.venues.data)} {...props} />;
  },
});

export default deferComponentRender(AsyncVenuesContainer);

export function preload() {
  AsyncVenuesContainer.preload();
  VenueLocation.preload();
}
