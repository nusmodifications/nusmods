// @flow
import type { Location } from 'react-router-dom';
import type { ComponentType } from 'react';

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

type Props = {
  location: Location,
};

type Options = {
  onComponentWillMount?: boolean,
  onComponentDidUpdate?: boolean,
};

const defaultOptions: Options = {
  onComponentWillMount: true,
  onComponentDidUpdate: true,
};

function scrollToTop() {
  window.scrollTo(0, 0);
}

const withScrollToTop = (WrappedComponent: ComponentType, options: Options = defaultOptions) => {
  return class withScrollToTopComponent extends Component<Props> {
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

export default (WrappedComponent: ComponentType, options?: Options) => {
  return withRouter(withScrollToTop(WrappedComponent, options));
};
