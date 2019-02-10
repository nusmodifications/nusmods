// @flow
import React, { PureComponent } from 'react';
import { Map as LeafletMap } from 'leaflet';
import { Map, Marker, TileLayer } from 'react-leaflet';
import { GestureHandling } from 'leaflet-gesture-handling';
import classnames from 'classnames';
import ExternalLink from 'views/components/ExternalLink';

import { markerIcon } from './icons';
import ExpandMap from './ExpandMap';
import BusStops from './BusStops';
import styles from './LocationMap.scss';

export type Props = {|
  +position: [number, number],
  +toggleScrollable?: (boolean) => void,
  +className?: string,
  +height?: string,
|};

type State = {|
  +isExpanded: boolean,
|};

LeafletMap.addInitHook('addHandler', 'gestureHandling', GestureHandling);

export default class LocationMap extends PureComponent<Props, State> {
  state: State = {
    isExpanded: false,
  };

  toggleMapExpand = () => {
    const isExpanded = !this.state.isExpanded;

    this.setState({ isExpanded });
    if (this.props.toggleScrollable) {
      this.props.toggleScrollable(!isExpanded);
    }
  };

  render() {
    const { position, className, height } = this.props;

    // Query param for https://developers.google.com/maps/documentation/urls/guide#search-action
    const googleMapQuery = encodeURIComponent(position.join(','));
    const { isExpanded } = this.state;

    // The map uses position: fixed when expanded so we don't need inline height
    const style = isExpanded ? {} : { height };

    return (
      <div
        style={style}
        className={classnames(styles.mapWrapper, className, { [styles.expanded]: isExpanded })}
      >
        <ExternalLink
          href={`https://www.google.com/maps/search/?api=1&query=${googleMapQuery}`}
          className={classnames('btn btn-sm btn-primary', styles.gmapBtn)}
        >
          Open in Google Maps
        </ExternalLink>

        <Map center={position} zoom={18} maxZoom={19} className={styles.map}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <BusStops />
          <Marker position={position} icon={markerIcon} />
          <ExpandMap isExpanded={isExpanded} onToggleExpand={this.toggleMapExpand} />
        </Map>
      </div>
    );
  }
}
