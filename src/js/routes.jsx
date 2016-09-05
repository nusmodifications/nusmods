import React from 'react';
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router';
import { createHistory } from 'history';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from 'stores/configure-store';

import AppContainer from 'views/AppContainer';
import NotFoundPage from 'views/NotFoundPage';

import HomePage from 'views/home/HomePage';
import ModuleFinderContainer from 'views/modules/ModuleFinderContainer';
import ModulePage from 'views/modules/ModulePage';

const store = configureStore();
const history = syncHistoryWithStore(useRouterHistory(createHistory)({
  basename: '/',
}), store);

export default function () {
  return (
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={AppContainer}>
          <IndexRoute component={HomePage} />
          <Route path="/modules" component={ModuleFinderContainer} />
          <Route path="/modules/:moduleCode" component={ModulePage} />
          <Route path="*" component={NotFoundPage} />
        </Route>
      </Router>
    </Provider>
  );
}
