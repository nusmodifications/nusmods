import { createResource } from 'utils/Resource';
import { getVenueLocations } from 'apis/github';
import type { VenueLocationMap } from 'types/venues';

// FIXME: Disable getVenueLocations' built in promise memoization as it's
// already memoized in Resource. Breaks resource reloads.
export default createResource<void, string, VenueLocationMap>(
  () => getVenueLocations(),
  () => 'venueLocationResource',
);
