// @flow
import type { Store } from 'redux';
import type { State } from 'reducers/index';

import React from 'react';
import { StaticRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';

import AppShell from 'views/AppShell';
import Routes from 'views/routes/Routes';

type Props = {
  store: Store<State, *, *>,
  location: string,
};

export default function App({ store, location }: Props) {
  return (
    <Provider store={store}>
      <Router context={{}} location={location}>
        <AppShell>
          <Routes />
        </AppShell>
      </Router>
    </Provider>
  );
}
