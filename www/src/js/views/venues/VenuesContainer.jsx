// @flow
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Helmet from 'react-helmet';
import classnames from 'classnames';
import axios from 'axios';
import qs from 'query-string';
import Raven from 'raven-js';
import { pick, mapValues, size, isEqual, findKey } from 'lodash';

import type { MapStateToProps } from 'react-redux';
import type { ContextRouter } from 'react-router-dom';
import type { Venue, VenueInfo, VenueSearchOptions } from 'types/venues';
import type { Semester } from 'types/modules';
import type { OnSelectVenue } from 'types/views';

import deferComponentRender from 'views/hocs/deferComponentRender';
import ErrorPage from 'views/errors/ErrorPage';
import Warning from 'views/errors/Warning';
import LoadingSpinner from 'views/components/LoadingSpinner';
import SearchBox from 'views/components/SearchBox';
import { Clock } from 'views/components/icons';
import { venuePage } from 'views/routes/paths';

import config from 'config';
import nusmods from 'apis/nusmods';
import HistoryDebouncer from 'utils/HistoryDebouncer';
import { searchVenue, filterAvailability } from 'utils/venues';
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
  activeSemester: Semester,
  urlVenue: ?Venue,
  matchBreakpoint: boolean,
};

type State = {
  loading: boolean,
  error?: any,
  venues: VenueInfo,

  // Selected venue
  selectedVenue: ?Venue,

  // Search state
  searchTerm: string,
  isAvailabilityEnabled: boolean,
  searchOptions: VenueSearchOptions,
};

const pageHead = (
  <Helmet>
    <title>Venues - {config.brandName}</title>
  </Helmet>
);

export class VenuesContainerComponent extends Component<Props, State> {
  history: HistoryDebouncer;

  constructor(props: Props) {
    super(props);

    const params = qs.parse(props.location.search);
    const selectedVenue = this.props.urlVenue;

    // Extract searchOptions from the query string if they are present
    const isAvailabilityEnabled = params.time && params.day && params.duration;
    const searchOptions = isAvailabilityEnabled
      ? mapValues(pick(params, ['time', 'day', 'duration']), (i) => parseInt(i, 10))
      : defaultSearchOptions();

    this.history = new HistoryDebouncer(props.history);
    this.state = {
      selectedVenue,
      searchOptions,
      isAvailabilityEnabled,
      loading: true,
      venues: {},
      searchTerm: params.q || '',
    };
  }

  componentDidMount() {
    axios
      .get(nusmods.venuesUrl(this.props.activeSemester))
      .then(({ data }) => {
        this.setState({
          loading: false,
          venues: data,
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

  renderSelectedVenue() {
    const { venues, selectedVenue } = this.state;
    if (!selectedVenue) return null;

    // Match case insensitively
    const lowercaseSelectedVenue = selectedVenue.toLowerCase();
    const venue = findKey(
      venues,
      (availability, name: Venue) => name.toLowerCase() === lowercaseSelectedVenue,
    );

    if (!venue) return null;
    const availability = venues[venue];

    return <VenueDetails venue={venue} availability={availability} />;
  }

  render() {
    const {
      searchTerm,
      loading,
      error,
      isAvailabilityEnabled,
      searchOptions,
      selectedVenue,
    } = this.state;

    if (error) {
      return <ErrorPage error="cannot load venues info" eventId={Raven.lastEventId()} />;
    }

    if (loading) {
      return (
        <div>
          {pageHead}
          <LoadingSpinner />
        </div>
      );
    }

    let venues = searchVenue(this.state.venues, searchTerm);
    const unfilteredCount = size(venues);

    if (isAvailabilityEnabled) {
      venues = filterAvailability(venues, searchOptions);
    }

    return (
      <div className={classnames('page-container', styles.pageContainer)}>
        {pageHead}

        <div className={styles.venuesList}>
          {this.renderSearch()}

          {size(venues) === 0 ? (
            this.renderNoResult(unfilteredCount)
          ) : (
            <VenueList
              venues={venues}
              onSelect={this.onVenueSelect}
              selectedVenue={selectedVenue}
            />
          )}
        </div>

        {this.props.matchBreakpoint ? (
          <Modal isOpen={selectedVenue != null} onRequestClose={this.onClearVenueSelect}>
            <CloseButton onClick={this.onClearVenueSelect} />
            {this.renderSelectedVenue()}
          </Modal>
        ) : (
          <div className={styles.venueDetail}>{this.renderSelectedVenue()}</div>
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
    activeSemester: state.app.activeSemester,
    urlVenue: venue,
  };
};

// Explicitly declare top level components for React hot reloading to work.
const responsiveVenueContainer = makeResponsive(VenuesContainerComponent, breakpointDown('sm'));
const connectedVenuesContainer = connect(mapStateToProps)(responsiveVenueContainer);
const routedVenuesContainer = withRouter(connectedVenuesContainer);
export default deferComponentRender(routedVenuesContainer);
