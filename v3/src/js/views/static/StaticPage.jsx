// @flow

import type { Node } from 'react';
import React from 'react';

type Props = {
  children: Node,
};

export default function StaticPage(props: Props) {
  return (
    <div className="page-container">
      <div className="row">
        <div className="col-md-8 offset-md-1">{props.children}</div>
      </div>
    </div>
  );
}
