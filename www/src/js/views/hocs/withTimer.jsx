// @flow
import React, { Component } from 'react';
import { differenceInMilliseconds } from 'date-fns';
import { wrapComponentName } from 'utils/react';

export type TimerData = {|
  currentTime: Date,
|};

function withTimer<Props: {}>(
  WrappedComponent: ComponentType<Props>,
  intervalInMs: number = 60 * 1000,
): ComponentType<$Diff<Props, TimerData>> {
  return class extends Component<Props, TimerData> {
    intervalId: IntervalID;

    static displayName = wrapComponentName(WrappedComponent, withTimer.name);

    state = {
      currentTime: new Date(),
    };

    componentDidMount() {
      this.intervalId = setInterval(() => this.setState({ currentTime: new Date() }), intervalInMs);
      document.addEventListener('visibilitychange', this.onPageVisibilityChange);
    }

    componentWillUnmount() {
      clearInterval(this.intervalId);
      document.removeEventListener('visibilitychange', this.onPageVisibilityChange);
    }

    onPageVisibilityChange = () => {
      // Page visibility changes when tabs go in and out of focus. When tabs
      // are out of focus, mobile browsers slow down timers, so we run an
      // additional check to make sure the page state has not drifted too far
      // from the wall clock
      if (
        !document.hidden &&
        differenceInMilliseconds(new Date(), this.state.currentTime) > intervalInMs
      ) {
        this.setState({ currentTime: new Date() });
      }
    };

    render() {
      return <WrappedComponent {...this.state} {...this.props} />;
    }
  };
}

export default withTimer;
