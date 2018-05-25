// @flow

import React from 'react';
import type { Node } from 'react';
import { Route } from 'react-router-dom';

type Props = {
  exact?: boolean,
  strict?: boolean,
  path: string,
  to: string,
};

/**
 * Redirects the user to an external URL using window.location on the client,
 * and a 302 redirect on the server. For internal URLs use the React Router
 * <Redirect> component
 */
export default function({ to, ...otherProps }: Props) {
  return (
    <Route
      {...otherProps}
      render={({ staticContext }): Node => {
        if (staticContext) {
          // eslint-disable-next-line no-param-reassign
          staticContext.url = to;
        }

        if (typeof window !== 'undefined') {
          window.location = to;
        }

        return null;
      }}
    />
  );
}
