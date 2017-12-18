// @flow
import type { ContextRouter, Location } from 'react-router-dom';

import { Component } from 'react';
import { withRouter } from 'react-router-dom';

type Props = {
  ...ContextRouter,
  location: Location,
  onComponentWillMount: boolean,
  onComponentDidUpdate: boolean,
};

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
