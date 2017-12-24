// @flow
import React, { Component } from 'react';

import { breakpointUp, wrapComponentName } from 'utils/react';
import type { Breakpoint } from 'utils/react';

type State = {
  matchBreakpoint: boolean,
};

function makeResponsive<Props: {}>(
  WrappedComponent: ComponentType<Props>,
  breakpoint: Breakpoint,
): ComponentType<$Diff<Props, State>> {
  return class extends Component<Props, State> {
    mql: ?MediaQueryList;

    static displayName = wrapComponentName(WrappedComponent, makeResponsive.name);

    state = {
      matchBreakpoint: false,
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
      if (e.matches !== this.state.matchBreakpoint) {
        this.setState({ matchBreakpoint: e.matches });
      }
    };

    render() {
      return <WrappedComponent matchBreakpoint={this.state.matchBreakpoint} {...this.props} />;
    }
  };
}

export default makeResponsive;
