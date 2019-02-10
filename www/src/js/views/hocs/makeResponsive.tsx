import * as React from 'react';
import json2mq from 'json2mq';

import { QueryObject } from 'utils/css';
import { wrapComponentName } from 'utils/react';

type State = {
  matchBreakpoint: boolean;
};

function makeResponsive<Props>(
  WrappedComponent: React.React.ComponentType<Props>,
  mediaQuery: string | QueryObject,
): React.React.ComponentType<Pick<Props, Exclude<keyof Props, keyof State>>> {
  const media = typeof mediaQuery === 'string' ? mediaQuery : json2mq(mediaQuery);

  return class extends React.Component<Props, State> {
    mql: MediaQueryList | null | undefined;

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
