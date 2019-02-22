import React from 'react';
import { Map, Marker, TileLayer } from 'react-leaflet';
import classnames from 'classnames';

import { LatLngTuple } from 'types/venues';
import ExternalLink from 'views/components/ExternalLink';

import { markerIcon } from './icons';
import ExpandMap from './ExpandMap';
import BusStops from './BusStops';
import MapContext from './MapContext';
import GestureHandling from './GestureHandling';
import styles from './LocationMap.scss';

type OwnProps = Readonly<{
  gestureHandling?: boolean;
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

export class LocationMapComponent extends React.PureComponent<Props, State> {
  static defaultProps = {
    position: defaultLocation,
    gestureHandling: true,
  };

  state: State = {
    isExpanded: false,
  };

  toggleMapExpand = () => {
    this.setState(
      (state) => ({ isExpanded: !state.isExpanded }),
      () => {
        // Use MapContext to propagate map expanded state upwards
        const { toggleExpanded } = this.props;
        if (toggleExpanded) toggleExpanded(this.state.isExpanded);
      },
    );
  };

  render() {
    const { position, className, height, children, gestureHandling } = this.props;
    const { isExpanded } = this.state;

    // The map uses position: fixed when expanded so we don't need inline height
    const style = isExpanded ? {} : { height };

    // Always disable gesture handling when the map is expanded
    const enableGestureHandling = isExpanded ? false : gestureHandling;

    return (
      <div
        style={style}
        className={classnames(styles.mapWrapper, className, { [styles.expanded]: isExpanded })}
      >
        <ExternalLink
          // Query param for https://developers.google.com/maps/documentation/urls/guide#search-action
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            position!.join(','),
          )}`}
          className={classnames('btn btn-sm btn-primary', styles.gmapBtn)}
        >
          Open in Google Maps
        </ExternalLink>

        {children}

        <Map center={position} zoom={18} maxZoom={19} className={styles.map}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <BusStops />

          {position && <Marker position={position} icon={markerIcon} />}

          <ExpandMap isExpanded={isExpanded} onToggleExpand={this.toggleMapExpand} />

          <GestureHandling
            isOn={
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              enableGestureHandling!
            }
          />
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
