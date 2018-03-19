// @flow

import React from 'react';
import Helmet from 'react-helmet';
import config from 'config';

type Props = {
  children: string,
  description: string,
};

function Title(props: Props) {
  // We use defer=false to allow Google Analytics autotrack to send the correct
  // page title. See bootstrapping/google-analytics.js
  return (
    <Helmet titleTemplate={`%s - ${config.brandName}`} defer={false}>
      <title>{props.children}</title>
      <meta property="description" content={props.description} />
      <meta property="og:title" content={props.children} />
      <meta property="og:description" content={props.description} />
    </Helmet>
  );
}

Title.defaultProps = {
  description:
    'NUSMods is a timetable builder and knowledge platform, providing students with a better way to plan their school timetable and useful module-related information that are community-driven.',
};

export default Title;
