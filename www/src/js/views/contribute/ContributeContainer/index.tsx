import * as React from 'react';
import React from 'react';
import Loadable, { LoadingProps } from 'react-loadable';

import LoadingSpinner from 'views/components/LoadingSpinner';
import ApiError from 'views/errors/ApiError';
import { retryImport } from 'utils/error';

const AsyncContributeContainer: React.ComponentType<{}> = Loadable({
  loader: () =>
    retryImport(() => import(/* webpackChunkName: "contribute" */ './ContributeContainer')),
  loading: (props: LoadingProps) => {
    if (props.error) {
      return <ApiError dataName="page" retry={props.retry} />;
    } else if (props.pastDelay) {
      return <LoadingSpinner />;
    }

    return null;
  },
});

export default AsyncContributeContainer;

export function preload() {
  AsyncContributeContainer.preload();
}
