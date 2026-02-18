import type { FC, PropsWithChildren } from 'react';

/**
 * Classes used by Leaflet to position controls.
 */
const POSITION_CLASSES = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right',
} as const;

type MapCustomControlProps = {
  position: keyof typeof POSITION_CLASSES;
};

/**
 * A React-Leaflet component that renders React elements in Leaflet's control pane.
 *
 * See: https://github.com/LiveBy/react-leaflet-control/issues/44#issuecomment-723469330
 */
const LeafletControl: FC<PropsWithChildren<MapCustomControlProps>> = ({
  position = 'topleft',
  children,
}) => (
  <div className={POSITION_CLASSES[position]}>
    <div className="leaflet-control leaflet-bar">{children}</div>
  </div>
);

export default LeafletControl;
