// flow-typed signature: e897e2c497bb24669d3f4f89c118518f
// flow-typed version: <<STUB>>/react-leaflet-control_v2/flow_v0.83.0

import React from 'react';

declare module 'react-leaflet-control' {
  declare type Position = 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  declare type Props = {
    position: Position,
  };

  declare class Control extends React$Component<Props> {}

  declare export default typeof Control;
}
