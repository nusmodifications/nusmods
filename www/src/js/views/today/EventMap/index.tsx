import withVenueLocations from 'views/components/map/withVenueLocations';

export default withVenueLocations(() =>
  import(/* webpackChunkName: "venue" */ './EventMap').then((module) => module.default),
);
