import { Store } from 'redux';

import * as React from 'react';
import type { FC, PropsWithChildren } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { State } from 'types/state';

import AppShell from 'views/AppShell';
import Routes from 'views/routes/Routes';
import { DIMENSIONS, setCustomDimensions } from 'bootstrapping/matomo';
import ErrorBoundary from 'views/errors/ErrorBoundary';
import ErrorPage from 'views/errors/ErrorPage';
import RehydrateGate from 'storage/RehydrateGate';
import { initStateWithPrevTab } from 'redux-state-sync';

type Props = {
  store: Store<State>;
};

const App: FC<PropsWithChildren<Props>> = ({ store }) => {
  const onBeforeLift = () => {
    const { theme, settings } = store.getState();

    setCustomDimensions({
      [DIMENSIONS.theme]: theme.id,
      [DIMENSIONS.beta]: String(!!settings.beta),
    });

    initStateWithPrevTab(store);
  };

  return (
    <ErrorBoundary errorPage={() => <ErrorPage showReportDialog />}>
      <Provider store={store}>
        <RehydrateGate onBeforeLift={onBeforeLift}>
          <Router>
            <AppShell>
              <Routes />
            </AppShell>
          </Router>
        </RehydrateGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
