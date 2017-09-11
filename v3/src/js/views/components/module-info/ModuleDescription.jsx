// @flow

import React from 'react';

type Props = {
  children: string,
};

export default function (props: Props) {
  // Decode some HTML entities
  const description = props.children
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<');

  return (<span>{description}</span>);
}
