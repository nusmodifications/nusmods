import * as React from 'react';

import { Venue, VenueLocationMap } from 'types/venues';
import LocationMap from 'views/components/map/LocationMap';
import { Map } from 'views/components/icons';
import styles from './EventMap.scss';

export type OwnProps = {
  readonly venue: Venue | null;
};

export type Props = OwnProps &
  Readonly<{
    venueLocations: VenueLocationMap;
  }>;

export default function EventMap(props: Props) {
  if (!props.venue) {
    return (
      <div className={styles.noLessonSelected}>
        <Map />
        <p>Select a lesson on the left to see its location</p>
      </div>
    );
  }

  const venueLocation = props.venueLocations[props.venue];
  if (!venueLocation || !venueLocation.location) {
    return <p>We don&apos;t have information about this venue :(</p>;
  }

  const position: [number, number] = [venueLocation.location.y, venueLocation.location.x];
  return <LocationMap height="100%" position={position} />;
}
