import withVenueLocations from 'views/components/map/withVenueLocations';
import { Props } from './EventMap';

const EventMap = withVenueLocations<Props>(() =>
  // TypeScript is sad about resolving dynamic import
  import(/* webpackChunkName: "venue" */ './EventMap').then((module) => module.default),
);

export default EventMap;
