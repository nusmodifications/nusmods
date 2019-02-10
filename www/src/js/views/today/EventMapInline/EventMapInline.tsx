import * as React from 'react';
import classnames from 'classnames';
/** @var { VenueLocationMap } */
import venueLocations from 'data/venues.json';
import { Venue, VenueLocation } from 'types/venues';
import LocationMap from 'views/components/map/LocationMap';
import styles from './EventMapInline.scss';

export type Props = {
  readonly isOpen: boolean;
  readonly className?: string;
  readonly venue: Venue;

  readonly toggleOpen: () => void;
};

export default function(props: Props) {
  const venueLocation: VenueLocation = venueLocations[props.venue];
  if (!venueLocation || !venueLocation.location) {
    return null;
  }

  if (!props.isOpen) {
    return (
      <div className={props.className}>
        <button onClick={props.toggleOpen} className={classnames(styles.openMap)}>
          Open Map
        </button>
      </div>
    );
  }

  const position = [venueLocation.location.y, venueLocation.location.x];
  return (
    <div className={props.className}>
      <LocationMap position={position} />
    </div>
  );
}
