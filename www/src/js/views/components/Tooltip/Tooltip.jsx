// @flow

import React from 'react';
import Tippy, { type TippyProps } from '@tippy.js/react';
import 'styles/tippy/tippy.css';

export type Props = TippyProps;

function Tooltip(props: Props) {
  return <Tippy {...props} />;
}

/* eslint-disable react/default-props-match-prop-types */
Tooltip.defaultProps = {
  performance: true,
};
/* eslint-enable */

export default Tooltip;
