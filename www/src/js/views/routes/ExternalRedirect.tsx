// @flow
import React from 'react';
import { Route } from 'react-router-dom';

type Props = {
  to: string,
  path: string,
  appendPath?: boolean,
};

export default function ExternalRedirect({ to, appendPath, path, ...props }: Props) {
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
        window.location = newLocation;
        return null;
      }}
    />
  );
}
