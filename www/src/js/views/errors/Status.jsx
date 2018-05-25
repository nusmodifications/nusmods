// @flow
import React, { type Node } from 'react';
import { Route } from 'react-router-dom';

type Props = {
  code: number,
  children?: Node,
};

/**
 * In SSR, this will cause the server to return the code of the innermost
 * <Status> component as the HTTP status code. Does nothing on the client.
 */
export default function Status({ code, children }: Props) {
  return (
    <Route
      render={({ staticContext }: any) => {
        if (staticContext) {
          // eslint-disable-next-line no-param-reassign
          staticContext.status = code;
        }

        return children;
      }}
    />
  );
}
