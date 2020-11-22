import { FC, memo, useCallback, useLayoutEffect } from 'react';
import { Maximize, Minimize } from 'react-feather';
import { useMap } from 'react-leaflet';
import Tooltip from 'views/components/Tooltip';
import LeafletControl from './LeafletControl';

type Props = {
  isExpanded: boolean;
  onToggleExpand: (boolean: boolean) => void;
};

const ExpandMap: FC<Props> = ({ isExpanded, onToggleExpand }) => {
  const map = useMap();

  useLayoutEffect(() => {
    // Leaflet maps need to have their cached size invalidated when their parent
    // element resizes
    map.invalidateSize();

    // Only enable gesture handling if the map is expanded. Users expect to be able
    // to pan / scroll the map when the map is the only thing on their screen.
    // This is a little hacky because we are changing the behavior of the outer map
    // component from inside it. Also the gestureHandling prop cannot be added to the
    // outer Map component, otherwise the disable() below won't work
    const { gestureHandling } = map;
    if (gestureHandling) {
      if (isExpanded) {
        gestureHandling.disable();
      } else {
        gestureHandling.enable();
      }
    }
  }, [isExpanded, map]);

  const expandMap = useCallback(() => {
    onToggleExpand(!isExpanded);
  }, [isExpanded, onToggleExpand]);

  const label = isExpanded ? 'Minimize map' : 'Maximize map';

  return (
    <LeafletControl position="bottomleft">
      <Tooltip content={label} touch="hold">
        <button
          aria-label={label}
          type="button"
          className="btn btn-sm btn-secondary"
          onClick={expandMap}
        >
          {isExpanded ? <Minimize /> : <Maximize />}
        </button>
      </Tooltip>
    </LeafletControl>
  );
};

export default memo(ExpandMap);
