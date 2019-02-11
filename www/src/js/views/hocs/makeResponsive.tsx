import * as React from 'react';
import json2mq, { QueryObject } from 'json2mq';

import { wrapComponentName } from 'utils/react';
import { Omit } from 'types/utils';

export interface WithBreakpoint {
  matchBreakpoint: boolean;
}

function makeResponsive<Props>(
  WrappedComponent: React.ComponentType<Props>,
  mediaQuery: string | QueryObject | QueryObject[],
): React.ComponentType<Omit<Props, keyof WithBreakpoint>> {
  const media = typeof mediaQuery === 'string' ? mediaQuery : json2mq(mediaQuery);

  return class extends React.Component<Omit<Props, keyof WithBreakpoint>, WithBreakpoint> {
    mql: MediaQueryList | null = null;

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
      // @ts-ignore TODO: Figure out what's wrong here
      return <WrappedComponent matchBreakpoint={this.state.matchBreakpoint} {...this.props} />;
    }
  };
}

export default makeResponsive;
