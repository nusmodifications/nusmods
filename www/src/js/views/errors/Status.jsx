// @flow
import React, { type Node } from 'react';
import { Route } from 'react-router-dom';

type Props = {
  code: number,
  children?: Node,
};

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
