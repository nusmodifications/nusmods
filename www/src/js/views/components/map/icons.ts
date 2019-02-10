// @flow

import { Icon } from 'leaflet';
// eslint-disable-next-line import/extensions
import marker from 'img/marker.svg?url';
import styles from './LocationMap.scss';

/* eslint-disable import/prefer-default-export */
export const markerIcon = new Icon({
  iconUrl: marker,
  className: styles.marker,
  // SVG is 365x560
  iconSize: [25, 38],
  iconAnchor: [13, 38],
});
