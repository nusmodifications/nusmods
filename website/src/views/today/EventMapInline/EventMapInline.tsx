import * as React from 'react';
import classnames from 'classnames';

import { LatLngTuple, Venue, VenueLocation, VenueLocationMap } from 'types/venues';
import LocationMap from 'views/components/map/LocationMap';
import styles from './EventMapInline.scss';

export type OwnProps = Readonly<{
  isOpen: boolean;
  className?: string;
  venue: Venue;

  toggleOpen: () => void;
}>;

export type Props = OwnProps & {
  readonly venueLocations: VenueLocationMap;
};

const EventMapInline: React.FunctionComponent<Props> = ({
  venue,
  isOpen,
  className,
  toggleOpen,
  venueLocations,
}) => {
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
};

export default EventMapInline;
