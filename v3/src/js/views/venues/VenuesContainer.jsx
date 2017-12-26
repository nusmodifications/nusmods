// @flow
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import deferComponentRender from 'views/hocs/deferComponentRender';
import Helmet from 'react-helmet';
import classnames from 'classnames';
import axios from 'axios';
import qs from 'query-string';
import Raven from 'raven-js';
import { pick, mapValues, size, isEqual } from 'lodash';

import type { MapStateToProps } from 'react-redux';
import type { ContextRouter } from 'react-router-dom';
import type { VenueInfo, VenueSearchOptions } from 'types/venues';
import type { Semester, Venue } from 'types/modules';

import ErrorPage from 'views/errors/ErrorPage';
import Warning from 'views/errors/Warning';
import LoadingSpinner from 'views/components/LoadingSpinner';
import VenueList from 'views/venues/VenueList';
import AvailabilitySearch, { defaultSearchOptions } from 'views/venues/AvailabilitySearch';
import SearchBox from 'views/components/SearchBox';
import { Clock, Search } from 'views/components/icons';

import config from 'config';
import nusmods from 'apis/nusmods';
import HistoryDebouncer from 'utils/HistoryDebouncer';
import { searchVenue, filterAvailability } from 'utils/venues';

import styles from './VenuesContainer.scss';
import SideMenu from '../components/SideMenu';

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
  isMenuOpen: boolean,
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
    const selectedVenue = this.props.urlVenue || '';

    // Extract searchOptions from the query string if they are present
    const isAvailabilityEnabled = params.time && params.day && params.duration;
    const searchOptions = isAvailabilityEnabled
      ? mapValues(pick(params, ['time', 'day', 'duration']), i => parseInt(i, 10))
      : defaultSearchOptions();

    this.history = new HistoryDebouncer(props.history);
    this.state = {
      selectedVenue,
      searchOptions,
      isAvailabilityEnabled,
      isMenuOpen: false,
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
      const scrollTargetY = this.state.selectedVenueElement.offsetTop;
      window.scrollTo(0, scrollTargetY);
    }
  }

  onVenueSelect = (selectedVenue: Venue, venueURL: string, selectedVenueElement: HTMLElement) =>
    this.setState({ selectedVenue, selectedVenueElement },
      () => this.updateURL(venueURL, false));

  onSearch = (searchTerm: string) => {
    if (searchTerm !== this.state.searchTerm) {
      this.setState({ searchTerm }, this.updateURL);
    }
  };

  onAvailabilityUpdate = (searchOptions: VenueSearchOptions) => {
    if (!isEqual(searchOptions, this.state.searchOptions)) {
      this.setState({ searchOptions }, this.updateURL);
    }
  };

  updateURL = (path?: string, debounce: boolean = true) => {
    const { searchTerm, isAvailabilityEnabled, searchOptions } = this.state;
    let query = {};

    if (searchTerm) query.q = searchTerm;
    if (isAvailabilityEnabled) query = { ...query, ...searchOptions };

    const pathname = path || this.props.location.pathname;
    const history = debounce ? this.history : this.props.history;
    history.push({
      ...this.props.location,
      search: qs.stringify(query),
      pathname,
    });
  };

  render() {
    const { isMenuOpen, searchTerm, selectedVenue, loading, error, isAvailabilityEnabled, searchOptions } = this.state;

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

        <div className="row">
          <div className="col-md-8 col-lg-9">
            {size(venues) === 0 ?
              <Fragment>
                <Warning message="No matching venues found" />
                {unfilteredCount && isAvailabilityEnabled &&
                  <p className="text-center text-muted">
                    There {unfilteredCount === 1
                      ? 'is a venue that is'
                      : `are ${unfilteredCount} venues that are`} not shown
                    because of they are not free. <br />
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={() => this.setState({ isAvailabilityEnabled: false })}
                    >
                      Cancel free room search?
                    </button>
                  </p>}
              </Fragment>
              :
              <VenueList
                venues={venues}
                expandedVenue={selectedVenue}
                onSelect={this.onVenueSelect}
              />}
          </div>
          <div className="col-md-4 col-lg-3">
            <SideMenu
              isOpen={isMenuOpen}
              openIcon={<Search aria-label="Search venues" />}
              toggleMenu={isOpen => this.setState({ isMenuOpen: isOpen })}
            >
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
                  onClick={() => this.setState({ isAvailabilityEnabled: !isAvailabilityEnabled }, this.updateURL)}
                >
                  <Clock className="svg" /> Find free rooms
                </button>

                {isAvailabilityEnabled &&
                  <AvailabilitySearch
                    isEnabled={isAvailabilityEnabled}
                    searchOptions={searchOptions}
                    onUpdate={this.onAvailabilityUpdate}
                  />}
              </div>
            </SideMenu>
          </div>
        </div>
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
const connectedVenuesContainer = connect(mapStateToProps)(VenuesContainerComponent);
const routedVenuesContainer = withRouter(connectedVenuesContainer);
export default deferComponentRender(routedVenuesContainer);
