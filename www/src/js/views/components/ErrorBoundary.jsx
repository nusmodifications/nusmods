// @flow

import React, { type Node, Component } from 'react';
import Raven from 'raven-js';

import ErrorPage from 'views/errors/ErrorPage';

type Props = {
  children: Node,
  captureError: boolean,
  errorPage: (error: Error, eventId: ?string) => Node,
};

type State = {
  error: ?Error,
};

export default class ErrorBoundary extends Component<Props, State> {
  eventId: ?string;

  static defaultProps = {
    captureError: true,
    errorPage: (error: Error, eventId: ?string) => <ErrorPage eventId={eventId} />,
  };

  state = {
    error: null,
  };

  componentDidCatch(error: Error, info: any) {
    this.setState({ error });

    if (this.props.captureError) {
      Raven.captureException(error, {
        extra: { info },
      });

      this.eventId = Raven.lastEventId();
    }
  }

  render() {
    if (this.state.error) {
      return this.props.errorPage(this.state.error, this.eventId);
    }

    return this.props.children;
  }
}
