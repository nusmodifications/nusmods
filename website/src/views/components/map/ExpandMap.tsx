import { PureComponent } from 'react';
import { withLeaflet, ContextProps } from 'react-leaflet';
import Control from 'react-leaflet-control';
import { Maximize, Minimize } from 'react-feather';
import Tooltip from 'views/components/Tooltip';

type Props = ContextProps & {
  readonly isExpanded: boolean;
  readonly onToggleExpand: (boolean: boolean) => void;
};

class ExpandMap extends PureComponent<Props> {
  componentDidUpdate() {
    if (this.props.leaflet && this.props.leaflet.map) {
      const { map } = this.props.leaflet;

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
        if (this.props.isExpanded) {
          gestureHandling.disable();
        } else {
          gestureHandling.enable();
        }
      }
    }
  }

  expandMap = () => {
    this.props.onToggleExpand(!this.props.isExpanded);
  };

  render() {
    const label = this.props.isExpanded ? 'Minimize map' : 'Maximize map';

    return (
      <Control position="bottomleft">
        <Tooltip content={label} touch="hold">
          <button
            aria-label={label}
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={this.expandMap}
          >
            {this.props.isExpanded ? <Minimize /> : <Maximize />}
          </button>
        </Tooltip>
      </Control>
    );
  }
}

export default withLeaflet(ExpandMap);
