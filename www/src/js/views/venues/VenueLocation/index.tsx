import * as React from 'react';
import Loadable, { LoadingProps } from 'react-loadable';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { retryImport } from 'utils/error';
import ApiError from 'views/errors/ApiError';
import { OwnProps } from './VenueLocation';

const AsyncVenueLocation: React.React.ComponentType<OwnProps> = Loadable({
  loader: () => retryImport(() => import(/* webpackChunkName: "venue" */ './VenueLocation')),
  loading: (props: LoadingProps) => {
    if (props.error) {
      return <ApiError dataName="page" retry={props.retry} />;
    } else if (props.pastDelay) {
      return <LoadingSpinner />;
    }

    return null;
  },
});

export default AsyncVenueLocation;
