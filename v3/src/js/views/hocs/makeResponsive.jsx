// @flow
import React, { Component } from 'react';

import { breakpointUp } from 'utils/react';
import type { Breakpoint } from 'utils/react';

type State = {
  isMatchBreakpoint: boolean,
};

function makeResponsive<Props: {}>(
  WrappedComponent: ComponentType<Props>,
  breakpoint: Breakpoint,
): ComponentType<$Diff<Props, State>> {
  return class extends Component<Props, State> {
    mql: ?MediaQueryList;
    state = {
      isMatchBreakpoint: false,
    };

    componentDidMount() {
      const mql = breakpointUp(breakpoint);
      mql.addListener(e => this.updateMediaQuery(e));
      this.updateMediaQuery(mql);
      this.mql = mql;
    }

    componentWillUnmount() {
      if (this.mql) {
        this.mql.removeListener(this.updateMediaQuery);
      }
    }

    updateMediaQuery = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches !== this.state.isMatchBreakpoint) {
        this.setState({ isMatchBreakpoint: e.matches });
      }
    };

    render() {
      return <WrappedComponent isMatchBreakpoint={this.state.isMatchBreakpoint} {...this.props} />;
    }
  };
}

export default makeResponsive;
