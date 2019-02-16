import * as React from 'react';
import classnames from 'classnames';
import venueLocations from 'data/venues';

import { LatLngTuple, Venue, VenueLocation } from 'types/venues';
import LocationMap from 'views/components/map/LocationMap';
import styles from './EventMapInline.scss';

export type Props = {
  readonly isOpen: boolean;
  readonly className?: string;
  readonly venue: Venue;

  readonly toggleOpen: () => void;
};

export default function({ venue, isOpen, className, toggleOpen }: Props) {
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
}
