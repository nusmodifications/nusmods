import * as React from 'react';
import { Helmet } from 'react-helmet';
import config from 'config';

type Props = {
  children: string;
  description?: string;
};

const Title: React.FC<Props> = ({
  children,
  description = 'NUSMods is a timetable builder and knowledge platform, providing students with a better way to plan their school timetable and useful module-related information that are community-driven.',
}) => {
  // We use defer=false to allow Google Analytics autotrack to send the correct
  // page title. See bootstrapping/google-analytics.js
  return (
    <Helmet titleTemplate={`%s - ${config.brandName}`} defer={false}>
      <title>{children}</title>
      <meta property="description" content={description} />
      <meta property="og:title" content={children} />
      <meta property="og:description" content={description} />
    </Helmet>
  );
};

export default Title;
