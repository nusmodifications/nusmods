import * as React from 'react';

import Loadable, { LoadingComponentProps } from 'react-loadable';

import LoadingSpinner from 'views/components/LoadingSpinner';
import ApiError from 'views/errors/ApiError';
import { retryImport } from 'utils/error';

const AsyncContributeContainer = Loadable({
  loader: () =>
    retryImport(() => import(/* webpackChunkName: "contribute" */ './ContributeContainer')),
  loading: (props: LoadingComponentProps) => {
    if (props.error) {
      return <ApiError dataName="page" retry={props.retry} />;
    }

    if (props.pastDelay) {
      return <LoadingSpinner />;
    }

    return null;
  },
});

export default AsyncContributeContainer;

export function preload() {
  AsyncContributeContainer.preload();
}
