// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import axios from 'axios';
import Raven from 'raven-js';

import type { VenueInfo } from 'types/venues';
import type { Semester } from 'types/modules';

import ErrorPage from 'views/errors/ErrorPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import VenueList from 'views/venues/VenueList';

import config from 'config';
import nusmods from 'apis/nusmods';

type Props = {
  activeSemester: Semester,
};

type State = {
  loading: boolean,
  venues: VenueInfo,
  error?: any,
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

  render() {
    const { venues, loading, error } = this.state;

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

    return (
      <div className="modules-page-container page-container">
        {pageHead}

        <div className="row">
          <div className="col-sm-12">
            <h1 className="page-title">Venues</h1>
            <VenueList venues={venues} />
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
