import retryImport from 'utils/retryImport';
import withVenueLocations from 'views/components/map/withVenueLocations';
import { Props } from './VenueLocation';

export default withVenueLocations<Props>(() =>
  retryImport(() => import(/* webpackChunkName: "venue" */ './VenueLocation')).then(
    (module) => module.default,
  ),
);
