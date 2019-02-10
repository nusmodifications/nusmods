import React from 'react';
import Loadable, { LoadingComponentProps } from 'react-loadable';

import LoadingSpinner from 'views/components/LoadingSpinner';
import ApiError from 'views/errors/ApiError';
import { Props } from './PlannerContainer';

const AsyncTodayContainer = Loadable<Props>({
  loader: () => import(/* webpackChunkName: "planner" */ './PlannerContainer'),
  loading: (props: LoadingComponentProps) => {
    if (props.error) {
      return <ApiError dataName="page" retry={props.retry} />;
    } else if (props.pastDelay) {
      return <LoadingSpinner />;
    }

    return null;
  },
});

export default AsyncTodayContainer;
