// Extend React Leaflet with init hooks from plugins
// TODO: This doesn't actually work - figure out why
import { MapOptions } from 'react-leaflet';

declare module 'react-leaflet' {
  import GestureHandling from 'leaflet-gesture-handling';

  interface MapOptions {
    gestureHandling: GestureHandling;
  }
}
