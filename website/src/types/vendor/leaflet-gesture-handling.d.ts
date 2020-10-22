// Extend React Leaflet with init hooks from plugins
import { Map } from 'leaflet';
import GestureHandling from 'leaflet-gesture-handling';

declare module 'leaflet' {
  // eslint-disable-next-line no-shadow
  interface Map {
    gestureHandling?: GestureHandling;
  }
}
