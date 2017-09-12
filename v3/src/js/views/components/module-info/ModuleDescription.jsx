// @flow

import React from 'react';

type Props = {
  children: string,
};

export default function (props: Props) {
  // Decode some HTML entities
  const description = props.children
    .replace('&amp;', '&')
    .replace('&quot;', '"')
    .replace('&gt;', '>')
    .replace('&lt;', '<');

  return (<span>{description}</span>);
}
