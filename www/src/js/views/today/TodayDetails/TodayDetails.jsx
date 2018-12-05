// @flow

import React, { PureComponent } from 'react';
import { Map, Marker, TileLayer } from 'react-leaflet';
import type { Venue, VenueLocation as VenueLocationItem } from 'types/venues';
import { icon } from 'views/components/map/icons';
import ExpandMap from 'views/components/map/ExpandMap';
import styles from 'views/venues/VenueLocation/VenueLocation.scss';
/** @var { VenueLocationMap } */
import venueLocations from 'data/venues.json';

type Props = {
  venue: Venue,
};

export default class TodayDetails extends PureComponent<Props> {
  render() {
    const { venue } = this.props;
    const location: ?VenueLocationItem = venueLocations[venue];

    return (
      <div>
        <Map center={position} zoom={18} maxZoom={19} className={styles.map}>
          <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={icon} />
          <ExpandMap isExpanded={isExpanded} onToggleExpand={this.toggleMapExpand} />
        </Map>
      </div>
    );
  }
}
