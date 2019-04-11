import { MapEvents, Viewport } from 'react-leaflet';

declare module 'react-leaflet' {
  interface MapEvents {
    onviewportchange?: (viewport: Viewport | null) => void;
    onviewportchanged?: (viewport: Viewport | null) => void;
  }
}
