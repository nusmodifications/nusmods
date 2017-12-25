// @flow
import React, { Component } from 'react';
import json2mq from 'json2mq';

import type { QueryObject } from 'utils/css';
import { wrapComponentName } from 'utils/react';

type State = {
  matchBreakpoint: boolean,
};

function makeResponsive<Props: {}>(
  WrappedComponent: ComponentType<Props>,
  mediaQuery: string | QueryObject,
): ComponentType<$Diff<Props, State>> {
  const media = typeof mediaQuery === 'string' ? mediaQuery : json2mq(mediaQuery);

  return class extends Component<Props, State> {
    mql: ?MediaQueryList;

    static displayName = wrapComponentName(WrappedComponent, makeResponsive.name);

    state = {
      matchBreakpoint: false,
    };

    componentDidMount() {
      const mql = window.matchMedia(media);
      mql.addListener(this.updateMediaQuery);
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
