import React from 'react';
import { Router, Route, IndexRedirect } from 'react-router';
import { Provider } from 'react-redux';

import AppContainer from 'views/AppContainer';
import NotFoundPage from 'views/NotFoundPage';

import TimetableContainer from 'views/timetable/TimetableContainer';
import ModuleFinderContainer from 'views/modules/ModuleFinderContainer';
import ModulePageContainer from 'views/modules/ModulePageContainer';

/* eslint-disable react/prop-types */
export default function ({ store, history }) {
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
