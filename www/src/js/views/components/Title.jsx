// @flow

import React from 'react';
import Helmet from 'react-helmet';
import config from 'config';

type Props = {
  children: string,
};

export default function Title(props: Props) {
  // We use defer=false to allow Google Analytics autotrack to send the correct
  // page title. See bootstrapping/google-analytics.js
  return (
    <Helmet titleTemplate={`%s - ${config.brandName}`} defer={false}>
      <title>{props.children}</title>
    </Helmet>
  );
}
