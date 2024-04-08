import { FC, memo, useEffect } from 'react';
import { LatLngBoundsLiteral, LatLngExpression, Map } from 'leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { GestureHandling } from 'leaflet-gesture-handling';
import classnames from 'classnames';
import type { LatLngTuple } from 'types/venues';

import isbStopsJson from 'data/isb-stops.json';

import styles from './LocationMap.scss';
import ISBServices from './ISBServices';

const ViewingBounds = {
  KRC: {
    coordinates: [
      [1.2846, 103.7908],
      [1.3061, 103.7633],
    ] as LatLngBoundsLiteral,
    minZoom: 15,
    centerpoint: [
      [1.2907, 103.7854],
      [1.3021, 103.7691],
    ] as LatLngBoundsLiteral,
  },
  BTC: {
    coordinates: [
      [1.3249, 103.8122],
      [1.3164, 103.8226],
    ] as LatLngBoundsLiteral,
    minZoom: 16.5,
    centerpoint: [
      [1.31874, 103.82009],
      [1.32358, 103.81405],
    ] as LatLngBoundsLiteral,
  },
};

const isbStops = isbStopsJson;

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

// temporary component for debugging/developing is at the bottom of the file

function MapFocusSetter({ focusStop }: { focusStop: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (focusStop) {
      const stop = isbStops.find((s) => s.name === focusStop);
      if (stop) {
        map.flyTo([stop.latitude, stop.longitude], 18, {
          duration: 0.5,
          easeLinearity: 0.1,
        });
      }
    }
  }, [focusStop, map]);
  return null;
}

function MapBoundsSetter({ campus }: { campus: 'KRC' | 'BTC' }) {
  const map = useMap();
  const { coordinates, minZoom } = ViewingBounds[campus];

  useEffect(() => {
    map.setMaxBounds(coordinates);
    map.setMinZoom(minZoom);
    const centerbounds = ViewingBounds[campus].centerpoint;
    const centerpoint: LatLngExpression = [
      (centerbounds[0][0] + centerbounds[1][0]) / 2,
      (centerbounds[0][1] + centerbounds[1][1]) / 2,
    ];
    map.setView(centerpoint, minZoom, {
      animate: false,
    });
  }, [campus, map, minZoom, coordinates]);
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

  return (
    <div className={classnames(styles.mapWrapper, className)}>
      <MapContainer
        center={position}
        zoom={zoom || 18}
        maxZoom={18}
        className={`${styles.map}`}
        maxBoundsViscosity={0.8}
        zoomSnap={0.5}
        zoomDelta={0.5}
        minZoom={15}
      >
        <MapFocusSetter focusStop={focusStop} />
        <MapBoundsSetter campus={campus} />

        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          url="https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          className={styles.mapTile}
        />

        {hasSelection ? (
          <ISBServices
            mapMode="selected"
            selectedSegments={selectedSegments || []}
            selectedStops={selectedStops || []}
            onStopClicked={(s) => {
              onStopClicked(s);
              setFocusStop(s);
            }}
            focusStop={focusStop}
            campus={campus}
          />
        ) : (
          <ISBServices
            mapMode="all"
            onStopClicked={(s) => {
              onStopClicked(s);
              setFocusStop(s);
            }}
            focusStop={focusStop}
            campus={campus}
          />
        )}
      </MapContainer>
      {children}
    </div>
  );
};

export default memo(LocationMap);

// DEBUG/DEV FUNCTIONS

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

// function Debug() {
//   // const map = useMap();
//   const [currentZoom, setCurrentZoom] = useState(0);

//   const map = useMapEvents({
//     zoom: () => {
//       console.log('zoom', map.getZoom());
//       setCurrentZoom(map.getZoom());
//     },
//   });
//   // return null;
//   return <div className={styles.debug}>{`zoom: ${currentZoom}`}</div>;
// }
