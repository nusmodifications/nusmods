import * as React from 'react';
import Tippy, { TippyProps, TippySingleton, TippySingletonProps } from '@tippy.js/react';
import { animateFill } from 'tippy.js'; // eslint-disable-line import/no-extraneous-dependencies

import { isIOS } from 'bootstrapping/browser';

import 'styles/tippy/tippy.css';

// To use plugins, add them to DEFAULT_PLUGINS
const DEFAULT_PLUGINS = [animateFill];

export type Props = Omit<TippyProps, 'plugins'>;
const Tooltip: React.FC<Props> = (props) => {
  // Clone the props to make it extensible
  const tippyProps = { plugins: DEFAULT_PLUGINS, animateFill: true, ...props };

  // HACK: Emulate Android tooltip behavior (hold to show tooltip, tap to
  // activate click) on iOS
  if (tippyProps.touch === 'hold' && isIOS) {
    tippyProps.trigger = 'focus';
  }

  return <Tippy {...tippyProps} />;
};

export type TooltipGroupProps = Omit<TippySingletonProps, 'plugins'>;
const TooltipGroup: React.FC<TooltipGroupProps> = (props) => {
  const singletonProps = {
    plugins: DEFAULT_PLUGINS,
    animateFill: true,
    ...props,
  };

  return <TippySingleton {...singletonProps} />;
};

export default Tooltip;
export { TooltipGroup };
