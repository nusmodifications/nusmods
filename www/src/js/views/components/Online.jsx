// @flow

import { type Node, Component } from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import type { State } from 'reducers';

type Props = {
  children: Node | ((boolean) => Node),

  isOnline: boolean,
  isLive: boolean,
};

export class OnlineComponent extends Component<Props> {
  static defaultProps = {
    isLive: true,
  };

  shouldComponentUpdate(nextProps: Props) {
    // Do not rerender if the component is not live and the only thing
    // that has changed is the online status
    return nextProps.isLive || nextProps.children !== this.props.children;
  }

  render() {
    const { children, isOnline } = this.props;

    if (typeof children === 'function') return children(isOnline);
    if (isOnline) return children;
    return null;
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  isOnline: state.app.isOnline,
});
export default connect(mapStateToProps)(OnlineComponent);
