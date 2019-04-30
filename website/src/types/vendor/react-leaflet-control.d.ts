declare module 'react-leaflet-control' {
  import * as React from 'react';
  import { ControlPosition } from 'leaflet';

  export interface ControlProps {
    position: ControlPosition;
  }

  const Control: React.ComponentType<ControlProps>;
  export default Control;
}
