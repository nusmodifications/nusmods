import React from 'react';
import { Map as LeafletMap } from 'leaflet';
import { Map, Marker, TileLayer } from 'react-leaflet';
import { GestureHandling } from 'leaflet-gesture-handling';
import classnames from 'classnames';
import ExternalLink from 'views/components/ExternalLink';

import { LatLngTuple } from 'types/venues';
import { markerIcon } from './icons';
import ExpandMap from './ExpandMap';
import BusStops from './BusStops';
import styles from './LocationMap.scss';
import MapContext from './MapContext';

type OwnProps = Readonly<{
  position?: [number, number];
  className?: string;
  height?: string;
}>;

type Props = OwnProps & {
  readonly toggleExpanded?: (boolean: boolean) => void;
};

type State = {
  readonly isExpanded: boolean;
};

export const defaultLocation: LatLngTuple = [1.2966113, 103.7732264];

LeafletMap.addInitHook('addHandler', 'gestureHandling', GestureHandling);

export class LocationMapComponent extends React.PureComponent<Props, State> {
  static defaultProps = {
    position: defaultLocation,
  };

  state: State = {
    isExpanded: false,
  };

  toggleMapExpand = () => {
    this.setState(
      (state) => ({ isExpanded: !state.isExpanded }),
      () => {
        if (this.props.toggleExpanded) {
          this.props.toggleExpanded(this.state.isExpanded);
        }
      },
    );
  };

  render() {
    const { position, className, height } = this.props;

    const { isExpanded } = this.state;

    // The map uses position: fixed when expanded so we don't need inline height
    const style = isExpanded ? {} : { height };

    return (
      <div
        style={style}
        className={classnames(styles.mapWrapper, className, { [styles.expanded]: isExpanded })}
      >
        {position && (
          <ExternalLink
            // Query param for https://developers.google.com/maps/documentation/urls/guide#search-action
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              position.join(','),
            )}`}
            className={classnames('btn btn-sm btn-primary', styles.gmapBtn)}
          >
            Open in Google Maps
          </ExternalLink>
        )}

        {this.props.children}

        <Map center={position} zoom={18} maxZoom={19} className={styles.map}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <BusStops />

          {position && <Marker position={position} icon={markerIcon} />}

          <ExpandMap isExpanded={isExpanded} onToggleExpand={this.toggleMapExpand} />
        </Map>
      </div>
    );
  }
}

export default function LocationMap(props: OwnProps) {
  return (
    <MapContext.Consumer>
      {({ toggleMapExpanded }) => (
        <LocationMapComponent toggleExpanded={toggleMapExpanded} {...props} />
      )}
    </MapContext.Consumer>
  );
}
