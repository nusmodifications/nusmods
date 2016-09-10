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
import ModulePageContainer from 'views/modules/ModulePageContainer';

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
          <Route path="/modules/:moduleCode" component={ModulePageContainer}/>
          <Route path="*" component={NotFoundPage}/>
        </Route>
      </Router>
    </Provider>
  );
}
