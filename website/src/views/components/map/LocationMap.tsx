import * as React from 'react';
import { Map as LeafletMap } from 'leaflet';
import { Map, Marker, TileLayer, Polygon, Tooltip } from 'react-leaflet';
import { GestureHandling } from 'leaflet-gesture-handling';
import classnames from 'classnames';
import { map } from 'lodash';

import ExternalLink from 'views/components/ExternalLink';
import useGlobalDebugValue from 'views/hooks/useGlobalDebugValue';
import covidZonesData from 'data/covidZones';

import { markerIcon } from './icons';
import ExpandMap from './ExpandMap';
import BusStops from './BusStops';
import styles from './LocationMap.scss';
import MapContext from './MapContext';

type OwnProps = {
  readonly position: [number, number];
  readonly className?: string;
  readonly height?: string;
};

type Props = OwnProps & {
  readonly toggleExpanded?: (boolean: boolean) => void;
};

LeafletMap.addInitHook('addHandler', 'gestureHandling', GestureHandling);

export const LocationMapComponent = React.memo<Props>(
  ({ position, className, height, toggleExpanded }) => {
    const [isExpanded, setExpanded] = React.useState(false);
    const covidZones = useGlobalDebugValue('SET_COVID_ZONES', covidZonesData);

    const toggleMapExpand = React.useCallback(() => {
      setExpanded(!isExpanded);
      if (toggleExpanded) toggleExpanded(!isExpanded);
    }, [isExpanded, toggleExpanded]);

    // Query param for https://developers.google.com/maps/documentation/urls/guide#search-action
    const googleMapQuery = encodeURIComponent(position.join(','));

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

          {map(covidZones, ({ positions, color }, id) => (
            <React.Fragment key={id}>
              <Polygon positions={positions} color={color} interactive={false}>
                <Tooltip
                  className={styles.covidZoneLabel}
                  direction="center"
                  interactive={false}
                  permanent
                >
                  Zone&nbsp;{id}
                </Tooltip>
              </Polygon>
            </React.Fragment>
          ))}

          <Marker position={position} icon={markerIcon} />

          <ExpandMap isExpanded={isExpanded} onToggleExpand={toggleMapExpand} />
        </Map>
      </div>
    );
  },
);

const LocationMap: React.FC<OwnProps> = (props) => (
  <MapContext.Consumer>
    {({ toggleMapExpanded }) => (
      <LocationMapComponent toggleExpanded={toggleMapExpanded} {...props} />
    )}
  </MapContext.Consumer>
);

export default LocationMap;
