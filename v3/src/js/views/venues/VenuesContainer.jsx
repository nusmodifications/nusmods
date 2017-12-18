// @flow
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import classnames from 'classnames';
import axios from 'axios';
import qs from 'query-string';
import Raven from 'raven-js';
import { pick } from 'lodash';

import type { MapStateToProps } from 'react-redux';
import type { ContextRouter } from 'react-router-dom';
import type { VenueInfo } from 'types/venues';
import type { Semester, Venue } from 'types/modules';

import ErrorPage from 'views/errors/ErrorPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import VenueList from 'views/venues/VenueList';
import SearchBox from 'views/components/SearchBox';
import withScrollToTop from 'views/components/withScrollToTop';

import config from 'config';
import nusmods from 'apis/nusmods';
import HistoryDebouncer from 'utils/HistoryDebouncer';

import styles from './VenuesContainer.scss';

type Props = {
  ...ContextRouter,
  activeSemester: Semester,
  urlVenue: ?Venue,
};

type State = {
  loading: boolean,
  venues: VenueInfo,
  error?: any,
  searchTerm: string,
  selectedVenue: Venue,
  selectedVenueElement?: HTMLElement,
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

    this.history = new HistoryDebouncer(props.history);
    this.state = {
      selectedVenue,
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

  onSearch = (searchTerm: string) => {
    this.setState({ searchTerm }, () => this.updateURL());
  };

  updateURL(path?: string) {
    const { searchTerm } = this.state;
    const query = {};
    if (searchTerm) {
      query.q = searchTerm;
    }

    const pathname = path || this.props.location.pathname;

    this.history.push({
      ...this.props.location,
      search: qs.stringify(query),
      pathname,
    });
  }

  filteredVenues() {
    const { venues, searchTerm } = this.state;
    if (!venues) {
      return {};
    }

    if (searchTerm === '') {
      return venues;
    }

    const lowercaseSearchStr = searchTerm.toLowerCase();
    return pick(venues, Object.keys(venues).filter(name =>
      name.toLowerCase().includes(lowercaseSearchStr)));
  }

  render() {
    const { loading, error } = this.state;

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

    const venues = this.filteredVenues();

    return (
      <div className={classnames('page-container', styles.pageContainer)}>
        {pageHead}

        <div className="row">
          <div className="col-sm-12">
            <SearchBox
              throttle={0}
              useInstantSearch
              initialSearchTerm={this.state.searchTerm}
              placeholder="Search for venues, e.g. LT27"
              onSearch={this.onSearch}
              rootElementRef={(element) => {
                if (element) {
                  this.searchBoxRootElement = element;
                }
              }}
            />
            <VenueList
              venues={venues}
              expandedVenue={this.state.selectedVenue}
              onSelect={this.onVenueSelect}
            />
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

export default connect(mapStateToProps)(
  withScrollToTop(withRouter(VenuesContainerComponent), {
    onComponentDidUpdate: false,
  })
);
