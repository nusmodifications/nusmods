import { Store } from 'redux';
import { State } from 'types/state';
import { Persistor } from 'storage/persistReducer';

import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import AppShell from 'views/AppShell';
import Routes from 'views/routes/Routes';
import { DIMENSIONS, setCustomDimensions } from 'bootstrapping/matomo';
import ErrorBoundary from 'views/errors/ErrorBoundary';
import ErrorPage from 'views/errors/ErrorPage';

type Props = {
  store: Store<State>;
  persistor: Persistor;
};

const App: React.FC<Props> = ({ store, persistor }) => {
  const onBeforeLift = () => {
    const { theme, settings } = store.getState();

    setCustomDimensions({
      [DIMENSIONS.theme]: theme.id,
      [DIMENSIONS.beta]: String(!!settings.beta),
    });
  };

  return (
    <ErrorBoundary errorPage={() => <ErrorPage showReportDialog />}>
      <Provider store={store}>
        <PersistGate persistor={persistor} onBeforeLift={onBeforeLift}>
          <Router>
            <AppShell>
              <Routes />
            </AppShell>
          </Router>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
