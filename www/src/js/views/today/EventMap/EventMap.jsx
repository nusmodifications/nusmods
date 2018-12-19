// @flow

import React from 'react';
/** @var { VenueLocationMap } */
import venueLocations from 'data/venues.json';
import type { Venue, VenueLocation } from 'types/venues';
import LocationMap from 'views/components/map/LocationMap';
import { Map } from 'views/components/icons';
import styles from './EventMap.scss';

export type Props = {|
  +venue: ?Venue,
|};

export default function(props: Props) {
  if (!props.venue) {
    return (
      <div className={styles.noLessonSelected}>
        <Map />
        <p>Select a venue on the left to see its timetable</p>
      </div>
    );
  }

  const venueLocation: VenueLocation = venueLocations[props.venue];
  if (!venueLocation || !venueLocation.location) {
    return <p>We don&apos;t have information about this venue :(</p>;
  }

  const position = [venueLocation.location.y, venueLocation.location.x];
  return <LocationMap className={styles.map} position={position} />;
}
