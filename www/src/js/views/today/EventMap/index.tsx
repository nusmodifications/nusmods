import * as React from 'react';
import Loadable, { LoadingProps } from 'react-loadable';
import { retryImport } from 'utils/error';
import ApiError from 'views/errors/ApiError';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { Props } from './EventMap';

export default Loadable<Props, any>({
  loader: () => retryImport(() => import(/* webpackChunkName: "venue" */ './EventMap')),
  loading: (props: LoadingProps) => {
    if (props.error) {
      return <ApiError dataName="page" retry={props.retry} />;
    } else if (props.pastDelay) {
      return <LoadingSpinner />;
    }

    return null;
  },
});
