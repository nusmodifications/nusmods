import { getVenueLocations } from 'apis/github';
import { JSResource } from 'utils/JSResource';

// FIXME: Disable getVenueLocations' built in promise memoization as it's
// already memoized in Resource. Breaks resource reloads.
export default JSResource('venueLocationResource', () => getVenueLocations());
