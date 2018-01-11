// @flow
import type { Store } from 'redux';
import type { Persistor } from 'redux-persist';
import type { State } from 'reducers';

import React from 'react';
import { AppContainer } from 'react-hot-loader'; // eslint-disable-line import/no-extraneous-dependencies
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';

import AppShell from 'views/AppShell';
import Routes from 'views/routes/Routes';
import storage from 'storage';

type Props = {
  store: Store<State, *, *>,
  persistor: Persistor,
};

export default function App({ store, persistor }: Props) {
  return (
    <AppContainer>
      <Provider store={store}>
        <PersistGate persistor={persistor} onBeforeLift={storage.stateMigrationComplete}>
          <Router>
            <AppShell>
              <Routes />
            </AppShell>
          </Router>
        </PersistGate>
      </Provider>
    </AppContainer>
  );
}
