// @flow

import type { ComponentType } from 'react';
import React from 'react';
import Loadable, { type LoadingProps } from 'react-loadable';

import LoadingSpinner from 'views/components/LoadingSpinner';
import ApiError from 'views/errors/ApiError';
import type { Props } from './PlannerContainer';

const AsyncTodayContainer: ComponentType<Props> = Loadable({
  loader: () => import(/* webpackChunkName: "planner" */ './PlannerContainer'),
  loading: (props: LoadingProps) => {
    if (props.error) {
      return <ApiError dataName="page" retry={props.retry} />;
    } else if (props.pastDelay) {
      return <LoadingSpinner />;
    }

    return null;
  },
});

export default AsyncTodayContainer;
