import * as React from 'react';
import { defer, wrapComponentName } from 'utils/react';

type State = {
  shouldRender: boolean;
};

/**
 * Allows two animation frames to complete to allow other components to update
 * and re-render before mounting and rendering an expensive `WrappedComponent`.
 *
 * Referenced from
 * https://medium.com/@paularmstrong/twitter-lite-and-high-performance-react-progressive-web-apps-at-scale-d28a00e780a3
 */
function deferComponentRender<Props>(
  WrappedComponent: React.ComponentType<Props>,
): React.ComponentType<Props> {
  return class extends React.Component<Props, State> {
    static displayName = wrapComponentName(WrappedComponent, deferComponentRender.name);

    override state = {
      shouldRender: false,
    };

    override componentDidMount() {
      defer(() => this.setState({ shouldRender: true }));
    }

    override render() {
      return this.state.shouldRender && <WrappedComponent {...this.props} />;
    }
  };
}

export default deferComponentRender;
