// @flow

import type { Node } from 'react';
import React from 'react';
import Helmet from 'react-helmet';
import config from 'config';

import ScrollToTop from 'views/components/ScrollToTop';

type Props = {
  title: string,
  children: Node,
};

function StaticPage(props: Props) {
  return (
    <div className="page-container">
      <ScrollToTop onComponentWillMount />
      <Helmet defer={false}>
        <title>
          {props.title} - {config.brandName}
        </title>
      </Helmet>
      <div className="row">
        <div className="col-md-8 offset-md-1">{props.children}</div>
      </div>
    </div>
  );
}

export default StaticPage;
