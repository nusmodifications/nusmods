import { useEffect } from 'react';
import { Map as LeafletMap } from 'leaflet';
import GestureHandlingPlugin from 'leaflet-gesture-handling';
import { withLeaflet, LeafletProps } from 'react-leaflet';

type Props = LeafletProps & {
  isOn: boolean;
};

LeafletMap.addInitHook('addHandler', 'gestureHandling', GestureHandlingPlugin);

function GestureHandling({ isOn, leaflet }: Props) {
  useEffect(() => {
    if (leaflet.map && leaflet.map.gestureHandling) {
      if (isOn) {
        leaflet.map.gestureHandling.enable();
      } else {
        leaflet.map.gestureHandling.disable();
      }
    }
  });

  // This component only has side effects on the Leaflet map, and so
  // does not render anything
  return null;
}

export default withLeaflet(GestureHandling);
