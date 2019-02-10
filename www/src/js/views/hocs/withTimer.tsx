
import { differenceInMilliseconds } from 'date-fns';
import { wrapComponentName } from 'utils/react';
import { forceTimer } from 'utils/debug';

export type TimerData = {
  currentTime: Date;
};

function getCurrentTime() {
  return forceTimer() || new Date();
}

function withTimer<Props>(
  WrappedComponent: React.ComponentType<Props>,
  intervalInMs: number = 60 * 1000,
): React.ComponentType<Pick<Props, Exclude<keyof Props, keyof TimerData>>> {
  return class extends React.Component<Props, TimerData> {
    intervalId: number;

    static displayName = wrapComponentName(WrappedComponent, withTimer.name);

    state = {
      currentTime: getCurrentTime(),
    };

    componentDidMount() {
      this.intervalId = setInterval(
        () => this.setState({ currentTime: getCurrentTime() }),
        intervalInMs,
      );
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
      const now = getCurrentTime();
      if (
        !document.hidden &&
        differenceInMilliseconds(now, this.state.currentTime) > intervalInMs
      ) {
        this.setState({ currentTime: now });
      }
    };

    render() {
      return <WrappedComponent {...this.state} {...this.props} />;
    }
  };
}

export default withTimer;
