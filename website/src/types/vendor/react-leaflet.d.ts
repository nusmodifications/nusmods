import { MapEvents, Viewport } from 'react-leaflet';

declare module 'react-leaflet' {
  // eslint-disable-next-line no-shadow
  interface MapEvents {
    onviewportchange?: (viewport: Viewport | null) => void;
    onviewportchanged?: (viewport: Viewport | null) => void;
  }
}
