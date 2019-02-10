import * as React from 'react';
import { captureException } from 'utils/error';

type Props = {
  children: React.ReactNode;
  captureError: boolean;
  errorPage: (error: Error) => React.ReactNode;
};

type State = {
  error: Error | null;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  static defaultProps = {
    captureError: true,
    errorPage: () => null,
  };

  state = {
    error: null,
  };

  componentDidCatch(error: Error, info: any) {
    this.setState({ error });

    if (this.props.captureError) {
      captureException(error, { info });
    }
  }

  render() {
    if (this.state.error) {
      return this.props.errorPage(this.state.error);
    }

    return this.props.children;
  }
}
