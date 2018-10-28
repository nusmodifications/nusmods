// @flow

import type { ContextRouter } from 'react-router-dom';

import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { scrollToHash } from 'utils/react';

export type Props = {
  ...ContextRouter,
  onComponentDidMount: boolean,
  onPathChange: boolean,
  scrollToHash: boolean,
};

function scrollToTop() {
  window.scrollTo(0, 0);
}

// $FlowFixMe - https://github.com/flowtype/flow-typed/issues/1179
export class ScrollToTopComponent extends Component<Props> {
  static defaultProps = {
    onComponentDidMount: false,
    onPathChange: false,
    scrollToHash: true,
  };

  componentDidMount() {
    if (this.props.onComponentDidMount && !window.location.hash) {
      scrollToTop();
    } else if (this.props.scrollToHash) {
      scrollToHash();
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
