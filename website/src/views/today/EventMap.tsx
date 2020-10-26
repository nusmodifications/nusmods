import React, { memo } from 'react';

import { Venue } from 'types/venues';
import LocationMap from 'views/components/map/LocationMap';
import { Map } from 'react-feather';
import venueLocationResource from 'views/components/map/venueLocationResource';
import styles from './EventMap.scss';

export type Props = {
  venue: Venue | null;
};

const EventMap = memo<Props>(({ venue }) => {
  const venueLocations = venueLocationResource.read();

  if (!venue) {
    return (
      <div className={styles.noLessonSelected}>
        <Map />
        <p>Select a lesson on the left to see its location</p>
      </div>
    );
  }

  const venueLocation = venueLocations[venue];
  if (!venueLocation || !venueLocation.location) {
    return <p>We don&apos;t have information about this venue :(</p>;
  }

  const position: [number, number] = [venueLocation.location.y, venueLocation.location.x];
  return <LocationMap height="100%" position={position} />;
});

export default EventMap;
