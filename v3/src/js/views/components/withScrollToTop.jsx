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

const defaultOptions: Options = {
  onComponentWillMount: true,
  onComponentDidUpdate: true,
};

function scrollToTop() {
  window.scrollTo(0, 0);
}

const withScrollToTop = (WrappedComponent: React.Node, options: Options = defaultOptions) => {
  return class extends Component {
    props: Props;

    componentWillMount() {
      if (options.onComponentWillMount) {
        scrollToTop();
      }
    }

    componentDidUpdate(prevProps: Props) {
      if (options.onComponentDidUpdate &&
        this.props.location.pathname !== prevProps.location.pathname) {
        scrollToTop();
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
};

export default (component, options: Options) => {
  return withRouter(withScrollToTop(component, options));
};
