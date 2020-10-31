import Loadable, { LoadingComponentProps } from 'react-loadable';

import LoadingSpinner from 'views/components/LoadingSpinner';
import ApiError from 'views/errors/ApiError';

const AsyncTodayContainer = Loadable({
  loader: () => import(/* webpackChunkName: "planner" */ './PlannerContainer'),
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
