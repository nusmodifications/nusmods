import React from 'react';
import { withLeaflet, LeafletProps } from 'react-leaflet';
import Control from 'react-leaflet-control';
import { Maximize, Minimize } from 'views/components/icons';
import Tooltip from 'views/components/Tooltip';

type Props = LeafletProps & {
  readonly isExpanded: boolean;
  readonly onToggleExpand: (boolean: boolean) => void;
};

class ExpandMap extends React.PureComponent<Props> {
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
            {this.props.isExpanded ? <Minimize /> : <Maximize />}
          </button>
        </Tooltip>
      </Control>
    );
  }
}

export default withLeaflet(ExpandMap);
