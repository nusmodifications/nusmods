// Extend React Leaflet with init hooks from plugins
import { MapOptions } from 'react-leaflet';

declare module 'react-leaflet' {
  import GestureHandling from 'leaflet-gesture-handling';

  interface MapOptions {
    gestureHandling: GestureHandling;
  }
}
