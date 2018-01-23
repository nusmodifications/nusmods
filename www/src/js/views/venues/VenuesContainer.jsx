// @flow
import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import classnames from 'classnames';
import axios from 'axios';
import qs from 'query-string';
import Raven from 'raven-js';
import { pick, mapValues, size, isEqual, get } from 'lodash';

import type { ContextRouter } from 'react-router-dom';
import type { Venue, VenueDetailList, VenueInfo, VenueSearchOptions } from 'types/venues';

import deferComponentRender from 'views/hocs/deferComponentRender';
import ErrorPage from 'views/errors/ErrorPage';
import Warning from 'views/errors/Warning';
import LoadingSpinner from 'views/components/LoadingSpinner';
import SearchBox from 'views/components/SearchBox';
import { Clock, Map } from 'views/components/icons';
import { venuePage } from 'views/routes/paths';

import config from 'config';
import nusmods from 'apis/nusmods';
import HistoryDebouncer from 'utils/HistoryDebouncer';
import { searchVenue, filterAvailability, sortVenues } from 'utils/venues';
import { breakpointDown } from 'utils/css';
import { defer } from 'utils/react';
import makeResponsive from 'views/hocs/makeResponsive';
import Modal from 'views/components/Modal';
import Title from 'views/components/Title';

import AvailabilitySearch, { defaultSearchOptions } from './AvailabilitySearch';
import VenueList from './VenueList';
import VenueDetails from './VenueDetails';
import styles from './VenuesContainer.scss';

/* eslint-disable react/prop-types */

type Props = {
  ...ContextRouter,
  matchBreakpoint: boolean,
};

type State = {|
  loading: boolean,
  error?: any,
  venues: ?VenueDetailList,

  // Search state
  searchTerm: string,
  isAvailabilityEnabled: boolean,
  searchOptions: VenueSearchOptions,
|};

const pageHead = <Title>Venues</Title>;

export class VenuesContainerComponent extends Component<Props, State> {
  history: HistoryDebouncer;

  constructor(props: Props) {
    super(props);

    const { location, history } = props;
    const params = qs.parse(location.search);

    // Extract searchOptions from the query string if they are present
    const isAvailabilityEnabled = !!(params.time && params.day && params.duration);
    const searchOptions = isAvailabilityEnabled
      ? mapValues(pick(params, ['time', 'day', 'duration']), (i) => parseInt(i, 10))
      : defaultSearchOptions();

    this.history = new HistoryDebouncer(history);
    this.state = {
      searchOptions,
      isAvailabilityEnabled,
      loading: true,
      venues: null,
      searchTerm: params.q || '',
    };
  }

  componentDidMount() {
    axios
      .get(nusmods.venuesUrl(config.semester))
      .then(({ data }: { data: VenueInfo }) => {
        this.setState({
          loading: false,
          venues: sortVenues(data),
        });
      })
      .catch((error) => {
        Raven.captureException(error);
        this.setState({ error });
      });
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    // Update URL if any of these props have changed
    const { searchOptions, searchTerm, isAvailabilityEnabled } = this.state;

    if (isAvailabilityEnabled !== prevState.isAvailabilityEnabled) {
      this.updateURL(false);
    } else if (searchOptions !== prevState.searchOptions || searchTerm !== prevState.searchTerm) {
      this.updateURL();
    }
  }

  onClearVenueSelect = () =>
    this.props.history.push({
      ...this.props.history.location,
      pathname: venuePage(),
    });

  onSearch = (searchTerm: string) => {
    if (searchTerm !== this.state.searchTerm) {
      defer(() => this.setState({ searchTerm }));
    }
  };

  onAvailabilityUpdate = (searchOptions: VenueSearchOptions) => {
    if (!isEqual(searchOptions, this.state.searchOptions)) {
      this.setState({ searchOptions });
    }
  };

  updateURL = (debounce: boolean = true) => {
    const { searchTerm, isAvailabilityEnabled, searchOptions } = this.state;
    let query = {};

    if (searchTerm) query.q = searchTerm;
    if (isAvailabilityEnabled) query = { ...query, ...searchOptions };

    const pathname = venuePage(this.selectedVenue());
    const history = debounce ? this.history : this.props.history;
    history.push({
      ...this.props.location,
      search: qs.stringify(query),
      pathname,
    });
  };

  selectedVenue(): ?Venue {
    const venue = this.props.match.params.venue;
    if (!venue) return null;
    return decodeURIComponent(venue);
  }

  renderSearch() {
    const { searchTerm, isAvailabilityEnabled, searchOptions } = this.state;

    return (
      <div className={styles.venueSearch}>
        <h3>Venue Search</h3>

        <SearchBox
          className={styles.searchBox}
          throttle={0}
          useInstantSearch
          initialSearchTerm={searchTerm}
          placeholder="e.g. LT27"
          onSearch={this.onSearch}
        />

        <button
          className={classnames(
            'btn btn-block btn-svg',
            styles.availabilityToggle,
            isAvailabilityEnabled ? 'btn-primary' : 'btn-outline-primary',
          )}
          onClick={() => this.setState({ isAvailabilityEnabled: !isAvailabilityEnabled })}
        >
          <Clock className="svg" /> Find free rooms
        </button>

        {isAvailabilityEnabled && (
          <div className={styles.availabilitySearch}>
            <AvailabilitySearch
              isEnabled={isAvailabilityEnabled}
              searchOptions={searchOptions}
              onUpdate={this.onAvailabilityUpdate}
            />
          </div>
        )}
      </div>
    );
  }

  renderNoResult(unfilteredCount: number) {
    const { isAvailabilityEnabled } = this.state;

    return (
      <Fragment>
        <Warning message="No matching venues found" />
        {!!unfilteredCount &&
          isAvailabilityEnabled && (
            <p className="text-center text-muted">
              {unfilteredCount === 1
                ? 'There is a venue that is not shown because it is not free'
                : `There are ${unfilteredCount} venues that are not shown because they are not free`}
              <br />
              <button
                type="button"
                className="btn btn-link"
                onClick={() => this.setState({ isAvailabilityEnabled: false })}
              >
                Cancel free room search
              </button>
            </p>
          )}
      </Fragment>
    );
  }

  renderSelectedVenue(matchedVenues: VenueDetailList) {
    const selectedVenue = this.selectedVenue();
    const { venues } = this.state;
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
      return <VenueDetails venue={venue} availability={availability} />;
    }

    const [venue, availability] = matchedVenues[venueIndex];
    const previous = get(matchedVenues, [String(venueIndex - 1), '0']);
    const next = get(matchedVenues, [String(venueIndex + 1), '0']);
    return (
      <VenueDetails venue={venue} availability={availability} next={next} previous={previous} />
    );
  }

  render() {
    const selectedVenue = this.selectedVenue();
    const { searchTerm, loading, error, isAvailabilityEnabled, searchOptions, venues } = this.state;

    if (error) {
      return <ErrorPage error="cannot load venues info" eventId={Raven.lastEventId()} />;
    }

    if (loading || !venues) {
      return (
        <div>
          {pageHead}
          <LoadingSpinner />
        </div>
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
          {this.renderSearch()}

          {size(matchedVenues) === 0 ? (
            this.renderNoResult(unfilteredCount)
          ) : (
            <VenueList venues={matchedVenues} selectedVenue={selectedVenue} />
          )}
        </div>

        {this.props.matchBreakpoint ? (
          <Modal
            isOpen={selectedVenue != null}
            onRequestClose={this.onClearVenueSelect}
            className={styles.venueDetailModal}
            fullscreen
          >
            <button
              className={classnames('btn btn-outline-primary btn-block', styles.closeButton)}
              onClick={this.onClearVenueSelect}
            >
              Back to Venues
            </button>
            {this.renderSelectedVenue(matchedVenues)}
          </Modal>
        ) : (
          <Fragment>
            <div className={styles.venueDetail}>
              {selectedVenue == null ? (
                <div className={styles.noVenueSelected}>
                  <Map />
                  <p>Select a venue on the left to see its timetable</p>
                </div>
              ) : (
                this.renderSelectedVenue(matchedVenues)
              )}
            </div>
            <div className={styles.background} />
          </Fragment>
        )}
      </div>
    );
  }
}

// Explicitly declare top level components for React hot reloading to work.
const responsiveVenueContainer = makeResponsive(VenuesContainerComponent, breakpointDown('sm'));
const routedVenuesContainer = withRouter(responsiveVenueContainer);
export default deferComponentRender(routedVenuesContainer);
