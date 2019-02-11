import * as React from 'react';
/** @var { VenueLocationMap } */
import venueLocationJSON from 'data/venues.json';
import { Venue, VenueLocation, VenueLocationMap } from 'types/venues';
import LocationMap from 'views/components/map/LocationMap';
import { Map } from 'views/components/icons';
import styles from './EventMap.scss';

const venueLocations = venueLocationJSON as VenueLocationMap;

export type Props = {
  readonly venue: Venue | null | undefined;
};

export default function(props: Props) {
  if (!props.venue) {
    return (
      <div className={styles.noLessonSelected}>
        <Map />
        <p>Select a lesson on the left to see its timetable</p>
      </div>
    );
  }

  const venueLocation: VenueLocation = venueLocations[props.venue];
  if (!venueLocation || !venueLocation.location) {
    return <p>We don&apos;t have information about this venue :(</p>;
  }

  const position: [number, number] = [venueLocation.location.y, venueLocation.location.x];
  return <LocationMap height="100%" position={position} />;
}
