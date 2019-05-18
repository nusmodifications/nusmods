import withVenueLocations from 'views/components/map/withVenueLocations';

export default withVenueLocations(
  // @ts-ignore: Error with resolving dynamic import with retries
  () => import(/* webpackChunkName: "venue" */ './EventMapInline').then((module) => module.default),
  // Don't show spinner or errors inline
  { Loading: () => null, Error: () => null },
);
