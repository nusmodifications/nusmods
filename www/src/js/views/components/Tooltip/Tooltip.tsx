// @flow

import React from 'react';
import Tippy, { type TippyProps } from '@tippy.js/react';
import bowser from 'bowser';
import 'styles/tippy/tippy.css';

export type Props = {|
  ...TippyProps,
|};

function Tooltip(props: Props) {
  const tippyProps = props;

  // HACK: Emulate Android tooltip behavior (hold to show tooltip, tap to
  // activate click) on iOS
  if (tippyProps.touchHold && bowser.ios) {
    tippyProps.trigger = 'focus';
  }

  return <Tippy {...tippyProps} />;
}

/* eslint-disable react/default-props-match-prop-types */
Tooltip.defaultProps = {
  performance: true,
};
/* eslint-enable */

export default Tooltip;
