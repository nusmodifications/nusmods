import withVenueLocations from 'views/components/map/withVenueLocations';

export default withVenueLocations(() =>
  // @ts-ignore: Error with resolving dynamic import with retries
  import(/* webpackChunkName: "venue" */ './EventMap').then((module) => module.default),
);
