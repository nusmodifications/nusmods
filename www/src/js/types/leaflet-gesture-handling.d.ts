// Extend React Leaflet with init hooks from plugins
import { MapInitHook } from 'react-leaflet';

declare module 'react-leaflet' {
  import GestureHandling from 'leaflet-gesture-handling';

  interface MapInitHook {
    gestureHandling: GestureHandling;
  }
}
