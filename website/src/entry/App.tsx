import { Store } from 'redux';
import { State } from 'types/state';
import { Persistor } from 'storage/persistReducer';

import React, { Suspense, useCallback, useMemo } from 'react';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// import AppShell from 'views/AppShell';
import Routes from 'views/routes/Routes';
import { DIMENSIONS, setCustomDimensions } from 'bootstrapping/matomo';
import ErrorBoundary from 'views/errors/ErrorBoundary';
import ErrorPage from 'views/errors/ErrorPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import ApiError from 'views/errors/ApiError';

type Props = {
  store: Store<State>;
  persistor: Persistor;
};

const App: React.FC<Props> = ({ store, persistor }) => {
  const onBeforeLift = useCallback(() => {
    const { theme, settings } = store.getState();

    setCustomDimensions({
      [DIMENSIONS.theme]: theme.id,
      [DIMENSIONS.beta]: String(!!settings.beta),
    });
  }, [store]);

  // <Router>
  //   <AppShell>
  //     <Routes />
  //   </AppShell>
  // </Router>
  return (
    <ErrorBoundary errorPage={() => <ErrorPage showReportDialog />}>
      <Provider store={store}>
        <PersistGate persistor={persistor} onBeforeLift={onBeforeLift}>
          <Router>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes />
            </Suspense>
          </Router>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default hot(App);
