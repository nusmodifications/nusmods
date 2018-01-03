import React from 'react';
import { AppContainer } from 'react-hot-loader'; // eslint-disable-line import/no-extraneous-dependencies
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';

// eslint-disable-next-line import/no-named-as-default
import AppShell from 'views/AppShell';
import Routes from 'views/routes/Routes';

/* eslint-disable react/prop-types */
export default function App({ store, persistor }) {
  return (
    <AppContainer>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
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
