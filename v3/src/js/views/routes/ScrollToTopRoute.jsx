// @flow
import type { LocationShape } from 'react-router-dom';

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

type Props = {
  path: string,
  location: LocationShape,
  component: React.Node,
};

type Options = {
  onComponentWillMount: boolean,
  onComponentDidUpdate: boolean,
};

// Taken from https://stackoverflow.com/a/44438949/1751946
const ScrollToTop = (component: React.Node, options: Options) => {
  return class ScrollToTopComponent extends Component {
    props: Props;

    componentWillMount() {
      if (options.onComponentWillMount) {
        window.scrollTo(0, 0);
      }
    }

    componentDidUpdate(prevProps: Props) {
      if (options.onComponentDidUpdate &&
        this.props.path === this.props.location.pathname &&
        this.props.location.pathname !== prevProps.location.pathname) {
        window.scrollTo(0, 0);
      }
    }

    render() {
      return <component {...this.props} />;
    }
  };
}

export default withRouter(ScrollToTopRoute);
