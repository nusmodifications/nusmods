import React from 'react';

import { Venue, VenueLocationMap } from 'types/venues';
import LocationMap from 'views/components/map/LocationMap';

export type OwnProps = {
  readonly venue: Venue | null;
};

export type Props = OwnProps &
  Readonly<{
    venueLocations: VenueLocationMap;
  }>;

export default function EventMap(props: Props) {
  // No venue selected - show the whole map
  if (!props.venue) {
    return <LocationMap height="100%" />;
  }

  // Venue selected but we don't have data
  // (should not be possible because we hide the button in EventMapInline)
  const venueLocation = props.venueLocations[props.venue];
  if (!venueLocation || !venueLocation.location) {
    return <p>We don&apos;t have information about this venue :(</p>;
  }

  // Venue selected and we have data
  const position: [number, number] = [venueLocation.location.y, venueLocation.location.x];
  return <LocationMap height="100%" position={position} />;
}
