// @flow

import type { ComponentType } from 'react';
import React from 'react';
import Loadable, { type LoadingProps } from 'react-loadable';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { retryImport } from 'utils/error';
import type { Props } from './TodayContainer';

const AsyncTodayContainer: ComponentType<Props> = Loadable({
  loader: () => retryImport(() => import(/* webpackChunkName: "today" */ './TodayContainer')),
  loading: (props: LoadingProps) => {
    if (props.error) {
      return (
        <div className="text-center">
          <p>Sorry, there was an error loading this page</p>
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

export default AsyncTodayContainer;
