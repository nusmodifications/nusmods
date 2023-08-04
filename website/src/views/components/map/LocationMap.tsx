import { FC, useState, useContext, useCallback, memo } from 'react';
import { Map } from 'leaflet';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { GestureHandling } from 'leaflet-gesture-handling';
import classnames from 'classnames';

import ExternalLink from 'views/components/ExternalLink';
import type { LatLngTuple } from 'types/venues';

import { markerIcon } from './icons';
import ExpandMap from './ExpandMap';
import BusStops from './BusStops';
import MapContext from './MapContext';
import MapViewportChanger from './MapViewportChanger';

import styles from './LocationMap.scss';

type Props = {
  readonly position: LatLngTuple;
  readonly className?: string;
  readonly height?: string;
};

Map.addInitHook('addHandler', 'gestureHandling', GestureHandling);

const LocationMap: FC<Props> = ({ position, className, height }) => {
  const [isExpanded, setExpanded] = useState(false);
  const { toggleMapExpanded } = useContext(MapContext);

  const toggleMapExpand = useCallback(() => {
    setExpanded(!isExpanded);
    toggleMapExpanded(!isExpanded);
  }, [isExpanded, toggleMapExpanded]);

  // Query param for https://developers.google.com/maps/documentation/urls/guide#search-action
  const googleMapQuery = encodeURIComponent(position.join(','));

  // The map uses position: fixed when expanded so we don't need inline height
  const style = isExpanded ? {} : { height };

  return (
    <div
      style={style}
      className={classnames(styles.mapWrapper, className, { [styles.expanded!]: isExpanded })}
    >
      <ExternalLink
        href={`https://www.google.com/maps/search/?api=1&query=${googleMapQuery}`}
        className={classnames('btn btn-sm btn-primary', styles.gmapBtn)}
      >
        Open in Google Maps
      </ExternalLink>

      <MapContainer center={position} zoom={18} maxZoom={18} className={styles.map}>
        <MapViewportChanger center={position} />

        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <BusStops />

        <Marker position={position} icon={markerIcon} />

        <ExpandMap isExpanded={isExpanded} onToggleExpand={toggleMapExpand} />
      </MapContainer>
    </div>
  );
};

export default memo(LocationMap);
