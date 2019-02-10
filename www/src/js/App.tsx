import { Store } from 'redux';
import { State } from 'reducers';
import { Persistor } from 'storage/persistReducer';

import * as React from 'react';
import { AppContainer } from 'react-hot-loader'; // eslint-disable-line import/no-extraneous-dependencies
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';

import AppShell from 'views/AppShell';
import Routes from 'views/routes/Routes';
import { DIMENSIONS, setCustomDimensions } from 'bootstrapping/matomo';

type Props = {
  store: Store<State, any, any>;
  persistor: Persistor;
};

export default function App({ store, persistor }: Props) {
  const onBeforeLift = () => {
    const { theme, settings } = store.getState();

    setCustomDimensions({
      [DIMENSIONS.theme]: theme.id,
      [DIMENSIONS.beta]: !!settings.beta,
    });
  };

  return (
    <AppContainer>
      <Provider store={store}>
        <PersistGate persistor={persistor} onBeforeLift={onBeforeLift}>
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
