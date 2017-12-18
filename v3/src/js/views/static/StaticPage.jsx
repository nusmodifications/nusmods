// @flow

import type { Node } from 'react';
import React from 'react';
import Helmet from 'react-helmet';
import config from 'config';

import withScrollToTop from 'views/components/withScrollToTop';

type Props = {
  title: string,
  children: Node,
};

function StaticPage(props: Props) {
  return (
    <div className="page-container">
      <Helmet>
        <title>{props.title} - {config.brandName}</title>
      </Helmet>

      <div className="row">
        <div className="col-md-8 offset-md-1">{props.children}</div>
      </div>
    </div>
  );
}

export default withScrollToTop(StaticPage);
