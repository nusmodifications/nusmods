// @flow

import React from 'react';
import Tippy, { type TippyProps } from '@tippy.js/react';
import bowser from 'bowser';
import 'styles/tippy/tippy.css';

export type Props = {|
  +wrapButton?: boolean,
  ...TippyProps,
|};

function Tooltip(props: Props) {
  // eslint-disable-next-line prefer-const
  let { wrapButton, ...tippyProps } = props;

  if (wrapButton) {
    tippyProps = {
      touchHold: true,
      ...tippyProps,
    };

    if (bowser.ios) tippyProps.trigger = 'focus';
  }

  return <Tippy {...tippyProps} />;
}

/* eslint-disable react/default-props-match-prop-types */
Tooltip.defaultProps = {
  performance: true,
};
/* eslint-enable */

export default Tooltip;
