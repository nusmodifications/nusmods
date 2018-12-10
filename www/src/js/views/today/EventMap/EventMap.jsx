// @flow

import React from 'react';
import classnames from 'classnames';
/** @var { VenueLocationMap } */
import venueLocations from 'data/venues.json';
import type { Venue, VenueLocation } from 'types/venues';
import LocationMap from 'views/components/map/LocationMap';
import styles from './EventMap.scss';

export type Props = {|
  +isOpen: boolean,
  +className?: string,
  +venue: Venue,

  +toggleOpen: () => void,
|};

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
