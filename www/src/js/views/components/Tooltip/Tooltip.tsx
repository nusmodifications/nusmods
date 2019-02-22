import React from 'react';
import Tippy, { TippyProps } from '@tippy.js/react';
import { isMobileIos } from 'utils/css';

import 'styles/tippy/tippy.css';

export type Props = TippyProps & {};

function Tooltip(props: Props) {
  const tippyProps = props;

  // HACK: Emulate Android tooltip behavior (hold to show tooltip, tap to
  // activate click) on iOS
  if (tippyProps.touchHold && isMobileIos()) {
    tippyProps.trigger = 'focus';
  }

  return <Tippy {...tippyProps} />;
}

Tooltip.defaultProps = {
  performance: true,
};

export default Tooltip;
