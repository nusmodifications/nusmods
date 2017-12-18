// @flow
import type { Location } from 'react-router-dom';

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

type Options = {
  onComponentWillMount?: boolean,
  onComponentDidUpdate?: boolean,
};

type Props = {
  location: Location,
} & Options;

function scrollToTop() {
  window.scrollTo(0, 0);
}

class ScrollToTopComponent extends Component<Props> {
  static defaultProps = {
    onComponentWillMount: true,
    onComponentDidUpdate: true,
  };

  componentWillMount() {
    if (this.props.onComponentWillMount) {
      scrollToTop();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.onComponentDidUpdate &&
      this.props.location.pathname !== prevProps.location.pathname) {
      scrollToTop();
    }
  }

  render() {
    return null;
  }
}

export default withRouter(ScrollToTopComponent);
