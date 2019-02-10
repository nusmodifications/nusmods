import * as React from 'react';
import { connect } from 'react-redux';
import { State } from 'reducers';

type Props = {
  children: Node | ((boolean) => Node);

  isOnline: boolean;
  isLive: boolean;
};

export class OnlineComponent extends React.Component<Props> {
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

export default connect((state: State) => ({
  isOnline: state.app.isOnline,
}))(OnlineComponent);
