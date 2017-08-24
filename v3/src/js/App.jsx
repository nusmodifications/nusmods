import React from 'react';
import { AppContainer } from 'react-hot-loader'; // eslint-disable-line import/no-extraneous-dependencies
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';

// eslint-disable-next-line import/no-named-as-default
import AppShell from 'views/AppShell';

/* eslint-disable react/prop-types */
export default function App({ store }) {
  return (
    <AppContainer>
      <Provider store={store}>
        <Router>
          <AppShell />
        </Router>
      </Provider>
    </AppContainer>
  );
}
