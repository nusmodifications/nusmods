// @flow
import React, { PureComponent } from 'react';

type State = {
  mounted: boolean,
};

export default function serverSkip<Props: {}>(WrappedComponent: ComponentType<Props>) {
  return class extends PureComponent<Props, State> {
    state = {
      mounted: false,
    };

    componentDidMount() {
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({ mounted: true });
    }

    render() {
      if (!this.state.mounted) {
        return null;
      }

      return <WrappedComponent />;
    }
  };
}
