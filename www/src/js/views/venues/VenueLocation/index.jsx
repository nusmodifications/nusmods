// @flow

import React from 'react';
import Loadable, { type LoadingProps } from 'react-loadable';
import LoadingSpinner from 'views/components/LoadingSpinner';

export default Loadable({
  loader: () => import(/* webpackChunkName: "venue" */ './VenueLocation'),
  loading: (props: LoadingProps) => {
    if (props.error) {
      return (
        <div className="text-center">
          <p>Sorry, there was an error loading the map</p>
          <button className="btn btn-outline-primary" onClick={props.retry}>
            Try Again
          </button>
        </div>
      );
    } else if (props.pastDelay) {
      return <LoadingSpinner />;
    }

    return null;
  },
});
