// @flow

import React, { type ComponentType } from 'react';
import Loadable, { type LoadingProps } from 'react-loadable';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { retryImport } from 'utils/error';
import ApiError from 'views/errors/ApiError';
import type { OwnProps } from './VenueLocation';

const AsyncVenueLocation: ComponentType<OwnProps> = Loadable({
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
