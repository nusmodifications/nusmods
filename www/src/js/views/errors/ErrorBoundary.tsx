// @flow
import { type Node, Component } from 'react';
import { captureException } from 'utils/error';

type Props = {
  children: Node,
  captureError: boolean,
  errorPage: (error: Error) => Node,
};

type State = {
  error: ?Error,
};

export default class ErrorBoundary extends Component<Props, State> {
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
