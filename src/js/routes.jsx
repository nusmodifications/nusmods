import React from 'react';
import { Router, Route, IndexRedirect, useRouterHistory } from 'react-router';
import { createHistory } from 'history';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from 'stores/configure-store';

import AppContainer from 'views/AppContainer';
import NotFoundPage from 'views/NotFoundPage';

import TimetableContainer from 'views/timetable/TimetableContainer';
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
          <IndexRedirect to="/timetable"/>
          <Route path="/timetable" component={TimetableContainer}/>
          <Route path="/modules" component={ModuleFinderContainer}/>
          <Route path="/modules/:moduleCode" component={ModulePage}/>
          <Route path="*" component={NotFoundPage}/>
        </Route>
      </Router>
    </Provider>
  );
}
