// @flow

import React from 'react';
import Loadable, { type LoadingProps } from 'react-loadable';
import ApiError from 'views/errors/ApiError';
import LoadingSpinner from 'views/components/LoadingSpinner';
import type { Props } from './EventMap';

export default Loadable<Props, *>({
  loader: () => import(/* webpackChunkName: "venue" */ './EventMap'),
  loading: (props: LoadingProps) => {
    if (props.error) {
      return <ApiError dataName="page" retry={props.retry} />;
    } else if (props.pastDelay) {
      return <LoadingSpinner />;
    }

    return null;
  },
});
