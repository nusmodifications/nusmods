// @flow
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import axios from 'axios';
import Raven from 'raven-js';
import { pick } from 'lodash';

import type { ContextRouter } from 'react-router-dom';
import type { VenueInfo } from 'types/venues';
import type { Semester, Venue } from 'types/modules';

import ErrorPage from 'views/errors/ErrorPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import VenueList from 'views/venues/VenueList';
import SearchBox from 'views/components/SearchBox';

import config from 'config';
import nusmods from 'apis/nusmods';

type Props = ContextRouter & {
  activeSemester: Semester,
  urlVenue: Venue,
};

type State = {
  loading: boolean,
  venues: VenueInfo,
  error?: any,
  searchTerm: string,
  selectedVenue: Venue,
};

const pageHead = (
  <Helmet>
    <title>Venues - {config.brandName}</title>
  </Helmet>
);

export class VenuesContainerComponent extends Component<Props, State> {
  state: State = {
    loading: true,
    venues: {},
    searchTerm: this.props.urlVenue || '',
    selectedVenue: this.props.urlVenue || '',
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

    // Don't change search term (which will filter the list of venues) if user clicked on one of
    // the venues in the list. This is a rather hacky way to determine this. action === "POP" when the
    // user reaches /venues/<venue> by typing the URL in the address bar or uses the back/forward buttons,
    // and action === "PUSH" when the user clicks a venue in the list.
    if (nextProps.history.action !== 'PUSH') {
      // urlVenue can be null when going from /venues/<venue> to /venues.
      this.setState({ searchTerm: nextProps.urlVenue || '' });
    }
  }

  onVenueSelect = (selectedVenue: Venue, venueURL: string) => {
    this.props.history.push(venueURL);
    this.setState({ selectedVenue });
  }

  filteredVenues() {
    const { venues, searchTerm } = this.state;
    if (!venues) {
      return [];
    }

    if (searchTerm === '') {
      return venues;
    }

    const lowercaseSearchStr = searchTerm.toLowerCase();
    return pick(venues, Object.keys(venues).filter(name =>
      name.toLowerCase().indexOf(lowercaseSearchStr) !== -1));
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
      <div className="modules-page-container page-container">
        {pageHead}

        <div className="row">
          <div className="col-sm-12">
            <SearchBox
              throttle={0}
              useInstantSearch
              initialSearchTerm={this.state.searchTerm}
              placeholder="Venues"
              onSearch={searchTerm => this.setState({ searchTerm })}
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

function mapStateToProps(state, ownProps): Props {
  let venue: Venue = ownProps.match.params.venue;
  if (venue) {
    venue = decodeURIComponent(venue);
  }

  return {
    ...ownProps, // To silence a Flow error
    activeSemester: state.app.activeSemester,
    urlVenue: venue,
  };
}

export default connect(mapStateToProps)(withRouter(VenuesContainerComponent));
