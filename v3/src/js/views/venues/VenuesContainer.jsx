// @flow
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import classnames from 'classnames';
import axios from 'axios';
import qs from 'query-string';
import Raven from 'raven-js';
import { pick, mapValues } from 'lodash';

import type { MapStateToProps } from 'react-redux';
import type { ContextRouter } from 'react-router-dom';
import type { VenueInfo, VenueSearchOptions } from 'types/venues';
import type { Semester, Venue } from 'types/modules';

import ErrorPage from 'views/errors/ErrorPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import VenueList from 'views/venues/VenueList';
import AvailabilitySearch, { defaultSearchOptions } from 'views/venues/AvailabilitySearch';
import SearchBox from 'views/components/SearchBox';

import config from 'config';
import nusmods from 'apis/nusmods';
import HistoryDebouncer from 'utils/HistoryDebouncer';
import { searchVenue, filterAvailability } from 'utils/venues';

import styles from './VenuesContainer.scss';

type Props = {
  ...ContextRouter,
  activeSemester: Semester,
  urlVenue: ?Venue,
};

type State = {
  loading: boolean,
  error?: any,
  venues: VenueInfo,

  // Selected venue
  selectedVenue: Venue,
  selectedVenueElement?: HTMLElement,

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
  // Store ref to search box root element so that we can access its height
  searchBoxRootElement: ?HTMLElement;
  history: HistoryDebouncer;

  constructor(props: Props) {
    super(props);

    const params = qs.parse(props.location.search);
    const selectedVenue = this.props.urlVenue || '';

    const isAvailabilityEnabled = params.time && params.day && params.duration;
    const searchOptions = isAvailabilityEnabled
      ? mapValues(pick(params, ['time', 'day', 'duration']), i => parseInt(i, 10))
      : defaultSearchOptions();

    this.history = new HistoryDebouncer(props.history);
    this.state = {
      selectedVenue,
      searchOptions,
      isAvailabilityEnabled,
      loading: true,
      venues: {},
      searchTerm: params.q || selectedVenue,
    };
  }

  componentDidMount() {
    axios.get(nusmods.venuesUrl(this.props.activeSemester))
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

  componentDidUpdate() {
    if (this.state.selectedVenueElement) {
      // Scroll selected venue's row to just below the search box
      let scrollTargetY = this.state.selectedVenueElement.offsetTop;
      if (this.searchBoxRootElement) {
        scrollTargetY -= this.searchBoxRootElement.offsetHeight;
      }
      window.scrollTo(0, scrollTargetY);
    }
  }

  onVenueSelect = (selectedVenue: Venue, venueURL: string, selectedVenueElement: HTMLElement) => {
    this.setState({ selectedVenue, selectedVenueElement },
      () => this.updateURL(venueURL));
  };

  onSearch = (searchTerm: string) => this.setState({ searchTerm }, this.updateURL);
  onAvailabilityUpdate = (searchOptions: VenueSearchOptions) => this.setState({ searchOptions }, this.updateURL);

  updateURL = (path?: string) => {
    const { searchTerm, isAvailabilityEnabled, searchOptions } = this.state;
    let query = {};

    if (searchTerm) query.q = searchTerm;
    if (isAvailabilityEnabled) query = { ...query, ...searchOptions };

    const pathname = path || this.props.location.pathname;

    this.history.push({
      ...this.props.location,
      search: qs.stringify(query),
      pathname,
    });
  };

  render() {
    const { loading, error, isAvailabilityEnabled, searchOptions } = this.state;

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

    let venues = searchVenue(this.state.venues, this.state.searchTerm);
    if (isAvailabilityEnabled) {
      venues = filterAvailability(venues, searchOptions);
    }

    return (
      <div className={classnames('page-container', styles.pageContainer)}>
        {pageHead}

        <div className={styles.searchPanel}>
          <div className={classnames('row align-items-center', styles.searchRow)}>
            <div className="col">
              <SearchBox
                className={styles.searchBox}
                throttle={0}
                useInstantSearch
                initialSearchTerm={this.state.searchTerm}
                placeholder="Search for venues, e.g. LT27"
                onSearch={this.onSearch}
                rootElementRef={(element) => {
                  if (element) this.searchBoxRootElement = element;
                }}
              />
            </div>

            <div className="col-auto">
              <button
                className={classnames('btn', isAvailabilityEnabled ? 'btn-primary' : 'btn-outline-primary')}
                onClick={() => this.setState({ isAvailabilityEnabled: !isAvailabilityEnabled })}
              >Find free rooms</button>
            </div>
          </div>

          {isAvailabilityEnabled &&
            <div className={styles.availabilityRow}>
              <AvailabilitySearch
                isEnabled={isAvailabilityEnabled}
                searchOptions={searchOptions}
                onUpdate={this.onAvailabilityUpdate}
              />
            </div>}
        </div>

        <VenueList
          venues={venues}
          expandedVenue={this.state.selectedVenue}
          onSelect={this.onVenueSelect}
        />
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

const VenuesContainerWithRouter = withRouter(VenuesContainerComponent);
export default connect(mapStateToProps)(VenuesContainerWithRouter);
