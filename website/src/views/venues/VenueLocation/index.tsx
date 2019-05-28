import { retryImport } from 'utils/error';
import withVenueLocations from 'views/components/map/withVenueLocations';

export default withVenueLocations(() =>
  // @ts-ignore: Error with resolving dynamic import with retries
  retryImport(() => import(/* webpackChunkName: "venue" */ './VenueLocation')).then(
    (module) => module.default,
  ),
);
