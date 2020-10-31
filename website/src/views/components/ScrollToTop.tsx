import { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { scrollToHash } from 'utils/react';

export type Props = RouteComponentProps & {
  onComponentDidMount?: boolean;
  onPathChange?: boolean;
  scrollToHash?: boolean;
};

function scrollToTop() {
  window.scrollTo(0, 0);
}

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
    const {
      onPathChange,
      location: { pathname, hash },
    } = this.props;

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
