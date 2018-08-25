// @flow
import React, { PureComponent } from 'react';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { VenueLocation as VenueLocationItem } from 'types/venues';
import marker from 'img/marker-icon.png';
import marker2x from 'img/marker-icon-2x.png';

/** @var { VenueLocationMap } */
import venueLocations from 'data/venues.json';
import styles from './VenueLocation.scss';

type Props = {
  venue: string,
};

const icon = new Icon({
  iconUrl: marker,
  iconRetinaUrl: marker2x,
  // Copied from Icon.Default
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
});

export default class VenueLocation extends PureComponent<Props> {
  render() {
    const location: ?VenueLocationItem = venueLocations[this.props.venue];

    if (!location) {
      return null;
    }

    const position = [location.location.y, location.location.x];

    return (
      <div className={styles.location}>
        <Map center={position} zoom={18} className={styles.map}>
          <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={icon} />
        </Map>
      </div>
    );
  }
}
