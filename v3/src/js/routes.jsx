import React from 'react';
import { Router, Route, IndexRoute, IndexRedirect } from 'react-router';
import { Provider } from 'react-redux';

/* eslint-disable import/no-named-as-default */
import AppContainer from 'views/AppContainer';
import NotFoundPage from 'views/NotFoundPage';

import AboutContainer from 'views/static/AboutContainer';
import FaqContainer from 'views/static/FaqContainer';
import TimetableContainer from 'views/timetable/TimetableContainer';
import ModulesContainer from 'views/browse/ModulesContainer';
import ModuleFinderContainer from 'views/browse/ModuleFinderContainer';
import ModulePageContainer from 'views/browse/ModulePageContainer';
import SettingsContainer from 'views/settings/SettingsContainer';

/* eslint-disable react/prop-types */
export default function ({ store, history }) {
  return (
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={AppContainer}>
          <IndexRedirect to="/timetable"/>
          <Route path="/about" component={AboutContainer}/>
          <Route path="/faq" component={FaqContainer}/>
          <Route path="/timetable" component={TimetableContainer}/>
          <Route path="/modules" component={ModulesContainer}>
            <IndexRoute component={ModuleFinderContainer}/>
            <Route path=":moduleCode" component={ModulePageContainer}/>
          </Route>
          <Route path="/settings" component={SettingsContainer}/>
          <Route path="*" component={NotFoundPage}/>
        </Route>
      </Router>
    </Provider>
  );
}
