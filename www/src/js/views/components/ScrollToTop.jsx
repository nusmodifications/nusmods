// @flow
import type { ContextRouter } from 'react-router-dom';

import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { scrollToHash } from 'utils/react';

type Props = {
  ...ContextRouter,
  onComponentWillMount: boolean,
  onPathChange: boolean,
};

function scrollToTop() {
  window.scrollTo(0, 0);
}

// $FlowFixMe - https://github.com/flowtype/flow-typed/issues/1179
export class ScrollToTopComponent extends Component<Props> {
  static defaultProps = {
    onComponentWillMount: false,
    onPathChange: false,
  };

  componentWillMount() {
    if (this.props.onComponentWillMount) {
      scrollToTop();
    }
  }

  componentDidMount() {
    scrollToHash();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.onPathChange && this.props.location.pathname !== prevProps.location.pathname) {
      scrollToTop();
    }
  }

  render() {
    return null;
  }
}

export default withRouter(ScrollToTopComponent);
