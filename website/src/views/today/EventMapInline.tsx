import React, { memo } from 'react';
import classnames from 'classnames';

import { LatLngTuple, Venue, VenueLocation } from 'types/venues';
import LocationMap from 'views/components/map/LocationMap';
import venueLocationResource from 'views/components/map/venueLocationResource';
import styles from './EventMapInline.scss';

export type Props = {
  isOpen: boolean;
  className?: string;
  venue: Venue;

  toggleOpen: () => void;
};

const EventMapInline = memo<Props>(({ venue, isOpen, className, toggleOpen }) => {
  const venueLocations = venueLocationResource.read();

  const venueLocation: VenueLocation = venueLocations[venue];
  if (!venueLocation || !venueLocation.location) {
    return null;
  }

  if (!isOpen) {
    return (
      <div className={className}>
        <button type="button" onClick={toggleOpen} className={classnames(styles.openMap)}>
          Open Map
        </button>
      </div>
    );
  }

  const position: LatLngTuple = [venueLocation.location.y, venueLocation.location.x];
  return (
    <div className={className}>
      <LocationMap position={position} />
    </div>
  );
});

export default EventMapInline;
