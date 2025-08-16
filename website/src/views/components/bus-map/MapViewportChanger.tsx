import { FC, useLayoutEffect } from 'react';
import type { LatLng } from 'leaflet';
import { useMap } from 'react-leaflet';
import type { LatLngTuple } from 'types/venues';

type Props = {
  center?: LatLng | LatLngTuple;
};

/**
 * Sets Leaflet map viewport to the provided props whenever those props are
 * changed.
 *
 * This component is necessary as changing `center` on `MapContainer` does not
 * affect the map.
 *
 * @see https://react-leaflet.js.org/docs/api-map#mapcontainer
 */
const MapViewportChanger: FC<Props> = ({ center }) => {
  const map = useMap();

  useLayoutEffect(() => {
    if (center !== undefined) {
      map.flyTo(center);
    }
  }, [map, center]);

  return null;
};

export default MapViewportChanger;
