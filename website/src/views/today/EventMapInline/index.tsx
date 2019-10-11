import withVenueLocations from 'views/components/map/withVenueLocations';
import { Props } from './EventMapInline';

export default withVenueLocations<Props>(
  () => import(/* webpackChunkName: "venue" */ './EventMapInline').then((module) => module.default),
  // Don't show spinner or errors inline
  { Loading: () => null, Error: () => null },
);
