import { Icon } from 'leaflet';
import marker from 'img/marker.svg';
import styles from './VenueLocation.scss';

/* eslint-disable import/prefer-default-export */
export const icon = new Icon({
  iconUrl: marker,
  className: styles.marker,
  // SVG is 365x560
  iconSize: [25, 38],
  iconAnchor: [13, 38],
});
