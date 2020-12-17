import Loadable, { LoadingComponentProps } from 'react-loadable';

import LoadingSpinner from 'views/components/LoadingSpinner';
import ApiError from 'views/errors/ApiError';
import retryImport from 'utils/retryImport';
import EventMapInline from '../EventMapInline';
import EventMap from '../EventMap';

const AsyncTodayContainer = Loadable({
  loader: () => retryImport(() => import(/* webpackChunkName: "today" */ './TodayContainer')),
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

export default AsyncTodayContainer;

export function preload() {
  AsyncTodayContainer.preload();
  EventMapInline.preload();
  EventMap.preload();
}
