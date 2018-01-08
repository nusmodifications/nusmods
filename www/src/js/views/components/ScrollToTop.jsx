// @flow
import type { ContextRouter } from 'react-router-dom';

import { Component } from 'react';
import { withRouter } from 'react-router-dom';

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
    if (this.props.onComponentWillMount && !window.location.hash) {
      scrollToTop();
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { onPathChange, location: { pathname, hash } } = this.props;

    if (
      onPathChange &&
      pathname !== prevProps.location.pathname &&
      hash === prevProps.location.hash
    ) {
      scrollToTop();
    }
  }

  render() {
    return null;
  }
}

export default withRouter(ScrollToTopComponent);
