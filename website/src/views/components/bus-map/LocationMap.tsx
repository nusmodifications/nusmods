import { FC, useState, useContext, useCallback, memo, useEffect } from 'react';
import { LatLngBoundsExpression, Map } from 'leaflet';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  SVGOverlay,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { GestureHandling } from 'leaflet-gesture-handling';
import classnames from 'classnames';

import ExternalLink from 'views/components/ExternalLink';
import type { LatLngTuple } from 'types/venues';

import isbServicesJson from 'data/isb-services.json';
import isbStopsJson from 'data/isb-stops.json';
import ExpandMap from './ExpandMap';
import MapContext from './MapContext';
import MapViewportChanger from './MapViewportChanger';

import styles from './LocationMap.scss';
import ISBServices from './ISBServices';

import { markerIcon } from './icons';

const ViewingBounds = {
  KRC: {
    coordinates: [
      [1.2846, 103.7908],
      [1.3061, 103.7633],
    ] as LatLngBoundsExpression,
    minZoom: 15,
    centerpoint: [
      [1.2907, 103.7854],
      [1.3021, 103.7691],
    ] as LatLngBoundsExpression,
  },
  BTC: {
    coordinates: [
      [1.3249, 103.8122],
      [1.3164, 103.8226],
    ] as LatLngBoundsExpression,
    minZoom: 16.5,
    centerpoint: [
      [1.31874, 103.82009],
      [1.32358, 103.81405],
    ] as LatLngBoundsExpression,
  },
};

const isbServices = isbServicesJson;
const isbStops = isbStopsJson;
const btcStops = ['CG', 'OTH', 'BG-MRT'];

// const isbServicesRoutes = isbServices.map((service) =>
//   getRoutesFromStops(service.stops, service.color),
// );

type Props = {
  readonly position: LatLngTuple;
  readonly className?: string;
  readonly height?: string;
  readonly zoom?: number;
  readonly onStopClicked: (stop: string | null) => void;
  readonly campus: 'KRC' | 'BTC';
  readonly focusStop: string | null;
  readonly setFocusStop: (stop: string | null) => void;
  readonly selectedSegments?: {
    start: string;
    end: string;
    color: string;
  }[];
  readonly selectedStops?: {
    name: string;
    color: string;
    subtext?: string;
  }[];
  readonly children?: React.ReactNode;
};

Map.addInitHook('addHandler', 'gestureHandling', GestureHandling);

// temporary component made to find latlng from just clicking on the map
// function LocationMarker() {
//   const [position, setPosition] = useState(null);
//   const map = useMapEvents({
//     click(e) {
//       console.log(e.latlng);
//       setPosition(e.latlng);
//       // copy to clipboard
//       const el = document.createElement('textarea');
//       el.value = `"latitude": ${e.latlng.lat},"longitude": ${e.latlng.lng},`;
//       document.body.appendChild(el);
//       el.select();
//       document.execCommand('copy');
//       map.flyTo(e.latlng, map.getZoom());
//     },
//   });

//   return position === null ? null : (
//     <Marker position={position} icon={markerIcon}>
//       <Popup>.</Popup>
//     </Marker>
//   );
// }

function Debug() {
  // const map = useMap();
  const [currentZoom, setCurrentZoom] = useState(0);

  const map = useMapEvents({
    zoom: () => {
      console.log('zoom', map.getZoom());
      setCurrentZoom(map.getZoom());
    },
  });
  // return null;
  return <div className={styles.debug}>{`zoom: ${currentZoom}`}</div>;
}

function MapFocusSetter({ focusStop }: { focusStop: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (focusStop) {
      const stop = isbStops.find((s) => s.name === focusStop);
      if (stop) {
        map.flyTo([stop.latitude, stop.longitude], 18);
      }
    }
  }, [focusStop]);
  return null;
}

function MapBoundsSetter({ campus }: { campus: 'KRC' | 'BTC' }) {
  const map = useMap();
  const { coordinates, minZoom, centerpoint } = ViewingBounds[campus];

  useEffect(() => {
    map.flyToBounds(centerpoint, { duration: 2, maxZoom: 15, easeLinearity: 0.1 });
    // wait until above is done
    setTimeout(() => {
      map.setMaxBounds(coordinates);
      map.setMinZoom(minZoom);
    }, 2000);
  }, [campus]);
  return null;
}

const LocationMap: FC<Props> = ({
  position,
  className,
  zoom,
  onStopClicked,
  campus,
  focusStop,
  setFocusStop,
  selectedSegments,
  selectedStops,
  children,
}) => {
  const hasSelection = selectedSegments || selectedStops;

  // const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
  // const selectedService = isbServices[selectedServiceIndex];
  // const selectedServiceRoutes = isbServicesRoutes[selectedServiceIndex];

  // focus map on stop
  return (
    <div className={classnames(styles.mapWrapper, className)}>
      {/* add a button to toggle between different map modes */}
      {/* <button
        className={classnames('btn btn-sm btn-primary', '')}
        onClick={() => {
          setMapMode(mapMode === 'all' ? 'selected' : 'all');
        }}
        type="button"
      >
        Toggle map mode
      </button> */}
      {/* <ExternalLink
        href={`https://www.google.com/maps/search/?api=1&query=${googleMapQuery}`}
        className={classnames('btn btn-sm btn-primary', styles.gmapBtn)}
      >
        Open in Google Maps
      </ExternalLink> */}
      {/* <button
        className={classnames('btn btn-sm btn-primary', styles.gmapBtn)}
        onClick={() => {
          setSelectedServiceIndex((selectedServiceIndex + 1) % isbServices.length);
        }}
        type="button"
      >
        Cycle between services
      </button> */}

      <MapContainer
        center={position}
        zoom={zoom || 18}
        maxZoom={18}
        className={`${styles.map} ${!hasSelection ? 'allRoutes' : ''}`}
        maxBoundsViscosity={0.8}
        zoomSnap={0.5}
        zoomDelta={0.5}
        minZoom={15}
      >
        <MapFocusSetter focusStop={focusStop} />
        <MapBoundsSetter campus={campus} />
        {/* <MapViewportChanger center={position} /> */}
        {/* <Debug /> */}

        {/* <LocationMarker /> */}
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          url="https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          className={styles.mapTile}
        />

        {/* <BusStops /> */}
        {hasSelection ? (
          <ISBServices
            mapMode="selected"
            selectedSegments={selectedSegments || []}
            selectedStops={selectedStops || []}
            onStopClicked={(s) => {
              onStopClicked(s);
              setFocusStop(s);
            }}
          />
        ) : (
          <ISBServices
            mapMode="all"
            onStopClicked={(s) => {
              onStopClicked(s);
              setFocusStop(s);
            }}
          />
        )}

        {/* <ExpandMap isExpanded={isExpanded} onToggleExpand={toggleMapExpand} /> */}
      </MapContainer>
      {children}
    </div>
  );
};

export default memo(LocationMap);
