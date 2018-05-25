// @flow
import type { Store } from 'redux';
import type { State } from 'reducers/index';
import React from 'react';
import { StaticRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';

import type { ServerRouterContext } from 'types/ssr';
import AppShell from 'views/AppShell';
import Routes from 'views/routes/Routes';

type Props = {
  store: Store<State, *, *>,
  location: string,
  context: ServerRouterContext,
};

export default function App({ store, location, context }: Props) {
  return (
    <Provider store={store}>
      <Router context={context} location={location}>
        <AppShell>
          <Routes />
        </AppShell>
      </Router>
    </Provider>
  );
}
