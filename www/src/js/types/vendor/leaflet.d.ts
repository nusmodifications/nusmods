import { MarkerOptions, PointExpression } from 'leaflet';

declare module 'leaflet' {
  interface MarkerOptions {
    autoPan?: boolean;
    autoPanPadding?: PointExpression;
    autoPanSpeed?: number;
  }
}
