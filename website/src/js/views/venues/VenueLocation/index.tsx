import { retryImport } from 'utils/error';
import withVenueLocations from 'views/components/map/withVenueLocations';

export default withVenueLocations(() =>
  retryImport(() => import(/* webpackChunkName: "venue" */ './VenueLocation')).then(
    (module) => module.default,
  ),
);
