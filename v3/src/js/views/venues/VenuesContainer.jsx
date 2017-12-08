// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import axios from 'axios';
import Raven from 'raven-js';
import { pick } from 'lodash';

import type { VenueInfo } from 'types/venues';
import type { Semester } from 'types/modules';

import ErrorPage from 'views/errors/ErrorPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import VenueList from 'views/venues/VenueList';
import SearchBox from 'views/components/SearchBox';

import config from 'config';
import nusmods from 'apis/nusmods';

type Props = {
  activeSemester: Semester,
};

type State = {
  loading: boolean,
  venues: VenueInfo,
  error?: any,
  searchTerm: string,
};

const pageHead = (
  <Helmet>
    <title>Venues - {config.brandName}</title>
  </Helmet>
);

class VenuesContainer extends Component<Props, State> {
  state: State = {
    loading: true,
    venues: {},
    searchTerm: '',
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

  filteredVenues() {
    const { venues, searchTerm } = this.state;
    if (!venues) {
      return null;
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
            {venues ? <VenueList venues={venues} /> : null}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state): Props {
  return {
    activeSemester: state.app.activeSemester,
  };
}

export default connect(mapStateToProps)(VenuesContainer);
