import * as React from 'react';

type MapContextValue = Readonly<{
  toggleMapExpanded: (boolean: boolean) => void;
}>;

const defaultValue: MapContextValue = {
  // Allows any parent component to listen to when the map component is expanded.
  // This is useful for toggling styles in the parent which may interfere with
  // map expanding.
  toggleMapExpanded: () => {},
};

const MapContext = React.createContext<MapContextValue>(defaultValue);

export default MapContext;
