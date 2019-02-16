// Extend React Leaflet with init hooks from plugins
import { Map } from 'react-leaflet';
import GestureHandling from 'leaflet-gesture-handling';

declare module 'react-leaflet' {
  interface Map {
    gestureHandling?: GestureHandling;
  }
}
