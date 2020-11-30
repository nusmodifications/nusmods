import * as React from 'react';
import json2mq, { QueryObject } from 'json2mq';

import { wrapComponentName } from 'utils/react';

export interface WithBreakpoint {
  matchBreakpoint: boolean;
}

function makeResponsive<Props extends WithBreakpoint>(
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
      return (
        // TODO: remove as Props hack as defined in:
        // https://github.com/Microsoft/TypeScript/issues/28938#issuecomment-450636046
        <WrappedComponent {...(this.props as Props)} matchBreakpoint={this.state.matchBreakpoint} />
      );
    }
  };
}

export default makeResponsive;
