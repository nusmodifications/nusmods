import { Store } from 'redux';
import { State } from 'types/state';
import { Persistor } from 'storage/persistReducer';

import React, { useCallback, useMemo } from 'react';
import { hot } from 'react-hot-loader/root';
// import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// import AppShell from 'views/AppShell';
// import Routes from 'views/routes/Routes';
import createRoutes from 'views/routes/createRoutes';
import { DIMENSIONS, setCustomDimensions } from 'bootstrapping/matomo';
import ErrorBoundary from 'views/errors/ErrorBoundary';
import ErrorPage from 'views/errors/ErrorPage';
import createRouter from 'views/routes/createRouter';
import RoutingContext from 'views/routes/RoutingContext';
import RouterRenderer from 'views/routes/RouteRenderer';

type Props = {
  store: Store<State>;
  persistor: Persistor;
};

// const router = createRouter(createRoutes(store.dispatch));

const App: React.FC<Props> = ({ store, persistor }) => {
  // Uses the custom router setup to define a router instanace that we can pass through context
  const router = useMemo(() => createRouter(createRoutes(store.dispatch)), [store.dispatch]);

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
          <RoutingContext.Provider value={router.context}>
            {/* Render the active route */}
            <RouterRenderer />
          </RoutingContext.Provider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default hot(App);
