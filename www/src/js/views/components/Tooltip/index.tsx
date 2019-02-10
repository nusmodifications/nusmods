import * as React from 'react';
import { retryImport } from 'utils/error';
import { Props } from './Tooltip';

// Can't use react-loadable for this since children and other props
// are not passed down - https://github.com/jamiebuilds/react-loadable/pull/161
export default class AsyncTooltip extends React.PureComponent<Props> {
  static Tooltip: React | null | undefined.React.ComponentType<Props>;

  componentDidMount() {
    if (!AsyncTooltip.Tooltip) {
      retryImport(() => import(/* webpackChunkName: "tooltip" */ './Tooltip')).then((module) => {
        // Dirty but it works
        AsyncTooltip.Tooltip = module.default;
        this.forceUpdate();
      });
    }
  }

  render() {
    const { children, ...props } = this.props;

    if (!AsyncTooltip.Tooltip) {
      return children;
    }

    return <AsyncTooltip.Tooltip {...props}>{children}</AsyncTooltip.Tooltip>;
  }
}
