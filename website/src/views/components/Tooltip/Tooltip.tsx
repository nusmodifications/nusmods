import * as React from 'react';
import Tippy, { TippyProps } from '@tippy.js/react';
import bowser from 'bowser';
import 'styles/tippy/tippy.css';

export type Props = TippyProps & {};

function Tooltip(props: Props) {
  const tippyProps = props;

  // HACK: Emulate Android tooltip behavior (hold to show tooltip, tap to
  // activate click) on iOS
  if (tippyProps.touchHold && bowser.ios) {
    tippyProps.trigger = 'focus';
  }

  return <Tippy {...tippyProps} />;
}

Tooltip.defaultProps = {
  performance: true,
};

export default Tooltip;
