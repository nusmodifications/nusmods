// @flow
import React, { type Node } from 'react';

type Props = {
  ...HTMLAnchorElement,
  children: Node,
};

// Renders an anchor tag that safely opens href in a new tab or window.
// See https://mathiasbynens.github.io/rel-noopener/
export default function AnchorBlank(props: Props) {
  const { children, ...otherProps } = props;
  return (
    <a target="_blank" rel="noopener noreferrer" {...otherProps}>
      {children}
    </a>
  );
}
