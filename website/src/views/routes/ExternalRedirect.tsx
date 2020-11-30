import * as React from 'react';
import { Route } from 'react-router-dom';

type Props = {
  to: string;
  path: string;
  appendPath?: boolean;
};

const ExternalRedirect: React.FC<Props> = ({ to, appendPath, path, ...props }) => {
  let newLocation = to;

  if (appendPath) {
    const { pathname } = window.location;
    newLocation += pathname.startsWith(path) ? pathname.substring(path.length) : pathname;
  }

  return (
    <Route
      {...props}
      path={path}
      render={() => {
        window.location.href = newLocation;
        return null;
      }}
    />
  );
};

export default ExternalRedirect;
