// @flow

import type { Node } from 'react';
import React from 'react';

import ScrollToTop from 'views/components/ScrollToTop';
import Title from 'views/components/Title';

type Props = {
  title: string,
  children: Node,
};

function StaticPage(props: Props) {
  return (
    <div className="page-container">
      <ScrollToTop onComponentWillMount />
      <Title>{props.title}</Title>
      <div className="row">
        <div className="col-md-8 offset-md-1">{props.children}</div>
      </div>
    </div>
  );
}

export default StaticPage;
