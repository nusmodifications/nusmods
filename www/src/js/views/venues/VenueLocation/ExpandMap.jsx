// @flow

import React, { PureComponent } from 'react';
import { withLeaflet, type LeafletContext } from 'react-leaflet';
import Control from 'react-leaflet-control';
import { Maximize, Minimize } from 'views/components/icons';

type Props = {
  leaflet: LeafletContext,

  isExpanded: boolean,
  onToggleExpand: (boolean) => void,
};

class ExpandMap extends PureComponent<Props> {
  componentDidMount() {
    // Workaround for https://github.com/LiveBy/react-leaflet-control/issues/27
    this.forceUpdate();
  }

  componentDidUpdate() {
    // Leaflet maps need to have their cached size invalidated when their parent
    // element resizes
    this.props.leaflet.map.invalidateSize();
  }

  expandMap = () => {
    this.props.onToggleExpand(!this.props.isExpanded);
  };

  render() {
    return (
      <Control position="bottomleft">
        <button type="button" className="btn btn-secondary" onClick={this.expandMap}>
          {this.props.isExpanded ? <Minimize /> : <Maximize />}
        </button>
      </Control>
    );
  }
}

export default withLeaflet(ExpandMap);
