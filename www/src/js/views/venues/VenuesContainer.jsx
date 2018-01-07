// @flow
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Helmet from 'react-helmet';
import classnames from 'classnames';
import axios from 'axios';
import qs from 'query-string';
import Raven from 'raven-js';
import { pick, mapValues, size, isEqual, get } from 'lodash';

import type { MapStateToProps } from 'react-redux';
import type { ContextRouter } from 'react-router-dom';
import type { Venue, VenueDetailList, VenueInfo, VenueSearchOptions } from 'types/venues';
import type { OnSelectVenue } from 'types/views';

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
import CloseButton from 'views/components/CloseButton';

import AvailabilitySearch, { defaultSearchOptions } from './AvailabilitySearch';
import VenueList from './VenueList';
import VenueDetails from './VenueDetails';
import styles from './VenuesContainer.scss';

type Props = {
  ...ContextRouter,
  urlVenue: ?Venue,
  matchBreakpoint: boolean,
};

type State = {|
  loading: boolean,
  error?: any,
  venues: ?VenueDetailList,

  // Selected venue
  selectedVenue: ?Venue,

  // Search state
  searchTerm: string,
  isAvailabilityEnabled: boolean,
  searchOptions: VenueSearchOptions,
|};

const pageHead = (
  <Helmet>
    <title>Venues - {config.brandName}</title>
  </Helmet>
);

export class VenuesContainerComponent extends Component<Props, State> {
  history: HistoryDebouncer;

  constructor(props: Props) {
    super(props);

    // Not sure why this is triggering ESLint
    const { location, history } = props; // eslint-disable-line react/prop-types

    const params = qs.parse(location.search);
    const selectedVenue = this.props.urlVenue;

    // Extract searchOptions from the query string if they are present
    const isAvailabilityEnabled = params.time && params.day && params.duration;
    const searchOptions = isAvailabilityEnabled
      ? mapValues(pick(params, ['time', 'day', 'duration']), (i) => parseInt(i, 10))
      : defaultSearchOptions();

    this.history = new HistoryDebouncer(history);
    this.state = {
      selectedVenue,
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

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.urlVenue) {
      this.setState({ selectedVenue: nextProps.urlVenue });
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    // Update URL if any of these props have changed
    const { selectedVenue, searchOptions, searchTerm, isAvailabilityEnabled } = this.state;

    if (
      selectedVenue !== prevState.selectedVenue ||
      isAvailabilityEnabled !== prevState.isAvailabilityEnabled
    ) {
      this.updateURL(false);
    } else if (searchOptions !== prevState.searchOptions || searchTerm !== prevState.searchTerm) {
      this.updateURL();
    }
  }

  onVenueSelect: OnSelectVenue = (selectedVenue) => this.setState({ selectedVenue });

  onClearVenueSelect = () => this.setState({ selectedVenue: null });

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
    const { searchTerm, isAvailabilityEnabled, searchOptions, selectedVenue } = this.state;
    let query = {};

    if (searchTerm) query.q = searchTerm;
    if (isAvailabilityEnabled) query = { ...query, ...searchOptions };

    const pathname = venuePage(selectedVenue);
    const history = debounce ? this.history : this.props.history;
    history.push({
      ...this.props.location,
      search: qs.stringify(query),
      pathname,
    });
  };

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
              There{' '}
              {unfilteredCount === 1
                ? 'is a venue that is'
                : `are ${unfilteredCount} venues that are`}{' '}
              not shown because they are not free.<br />
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
    const { venues, selectedVenue } = this.state;
    if (!venues || !selectedVenue) return null;

    // Find the index of the current venue on the list of matched venues so
    // we can obtain the previous and next item
    const lowercaseSelectedVenue = selectedVenue.toLowerCase();
    const venueIndex = matchedVenues.findIndex(
      ([venue]) => venue.toLowerCase() === lowercaseSelectedVenue,
    );

    // The selected item may not be in the list of matched venues (if the user
    // changed their search options afterwards, in which case we look for it in all
    // venues
    if (venueIndex === -1) {
      const venueDetail = venues.find(([venue]) => venue.toLowerCase() === lowercaseSelectedVenue);
      if (!venueDetail) return null;
      const [venue, availability] = venueDetail;
      return (
        <VenueDetails
          venue={venue}
          availability={availability}
          onSelectVenue={this.onVenueSelect}
        />
      );
    }

    const [venue, availability] = matchedVenues[venueIndex];
    const previous = get(matchedVenues, [String(venueIndex - 1), '0']);
    const next = get(matchedVenues, [String(venueIndex + 1), '0']);
    return (
      <VenueDetails
        venue={venue}
        availability={availability}
        next={next}
        previous={previous}
        onSelectVenue={this.onVenueSelect}
      />
    );
  }

  render() {
    const {
      searchTerm,
      loading,
      error,
      isAvailabilityEnabled,
      searchOptions,
      selectedVenue,
      venues,
    } = this.state;

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
            <VenueList
              venues={matchedVenues}
              onSelect={this.onVenueSelect}
              selectedVenue={selectedVenue}
            />
          )}
        </div>

        {this.props.matchBreakpoint ? (
          <Modal isOpen={selectedVenue != null} onRequestClose={this.onClearVenueSelect}>
            <CloseButton onClick={this.onClearVenueSelect} />
            {this.renderSelectedVenue(matchedVenues)}
          </Modal>
        ) : (
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
        )}
      </div>
    );
  }
}

export const mapStateToProps: MapStateToProps<*, *, *> = (state, ownProps) => {
  let venue: Venue = ownProps.match.params.venue;
  if (venue) {
    venue = decodeURIComponent(venue);
  }

  return {
    ...ownProps, // To silence a Flow error
    urlVenue: venue,
  };
};

// Explicitly declare top level components for React hot reloading to work.
const responsiveVenueContainer = makeResponsive(VenuesContainerComponent, breakpointDown('sm'));
const connectedVenuesContainer = connect(mapStateToProps)(responsiveVenueContainer);
const routedVenuesContainer = withRouter(connectedVenuesContainer);
export default deferComponentRender(routedVenuesContainer);
