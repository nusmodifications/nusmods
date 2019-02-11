import { MarkerOptions } from 'leaflet';

declare module 'leaflet' {
  interface MarkerOptions {
    autoPan?: boolean;
  }
}
