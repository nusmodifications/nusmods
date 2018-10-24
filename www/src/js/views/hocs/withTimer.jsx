// @flow
import React, { Component } from 'react';
import { wrapComponentName } from 'utils/react';

type State = {|
  currentTime: Date,
|};

function withTimer<Props: {}>(
  WrappedComponent: ComponentType<Props>,
  intervalInMs: number = 60 * 1000,
): ComponentType<$Diff<Props, State>> {
  return class extends Component<Props, State> {
    intervalId: IntervalID;

    static displayName = wrapComponentName(WrappedComponent, withTimer.name);

    state = {
      currentTime: new Date(),
    };

    componentDidMount() {
      this.intervalId = setInterval(() => this.setState({ currentTime: new Date() }), intervalInMs);
    }

    componentWillUnmount() {
      clearInterval(this.intervalId);
    }

    render() {
      return <WrappedComponent {...this.state} {...this.props} />;
    }
  };
}

export default withTimer;
