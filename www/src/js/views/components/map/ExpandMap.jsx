// @flow

import React, { PureComponent } from 'react';
import { withLeaflet, type LeafletContext } from 'react-leaflet';
import Control from 'react-leaflet-control';
import { MaximizeIcon, MinimizeIcon } from 'views/components/icons';
import Tooltip from 'views/components/Tooltip';

type Props = {|
  +leaflet: LeafletContext,

  +isExpanded: boolean,
  +onToggleExpand: (boolean) => void,
|};

class ExpandMap extends PureComponent<Props> {
  componentDidMount() {
    // Workaround for https://github.com/LiveBy/react-leaflet-control/issues/27
    this.forceUpdate();
  }

  componentDidUpdate() {
    const { map } = this.props.leaflet;

    if (map) {
      // Leaflet maps need to have their cached size invalidated when their parent
      // element resizes
      map.invalidateSize();

      // Only enable gesture handling if the map is expanded. Users expect to be able
      // to pan / scroll the map when the map is the only thing on their screen.
      // This is a little hacky because we are changing the behavior of the outer map
      // component from inside it. Also the gestureHandling prop cannot be added to the
      // outer Map component, otherwise the disable() below won't work
      if (this.props.isExpanded) {
        map.gestureHandling.disable();
      } else {
        map.gestureHandling.enable();
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
        <Tooltip content={label} touchHold>
          <button
            aria-label={label}
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={this.expandMap}
          >
            {this.props.isExpanded ? <MinimizeIcon /> : <MaximizeIcon />}
          </button>
        </Tooltip>
      </Control>
    );
  }
}

export default withLeaflet(ExpandMap);
