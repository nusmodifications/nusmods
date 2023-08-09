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

  override state: State = {
    error: null,
  };

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error });

    if (this.props.captureError) {
      captureException(error, { info });
    }
  }

  override render() {
    const { error } = this.state;

    if (error) {
      return this.props.errorPage(error);
    }

    return this.props.children;
  }
}
