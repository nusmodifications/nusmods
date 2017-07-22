// @flow
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import NotFoundPage from 'views/NotFoundPage';
import AboutContainer from 'views/static/AboutContainer';
import FaqContainer from 'views/static/FaqContainer';
import TimetableContainer from 'views/timetable/TimetableContainer';
import ModuleFinderContainer from 'views/browse/ModuleFinderContainer';
import ModulesContainer from 'views/browse/ModulePageContainer';
import SettingsContainer from 'views/settings/SettingsContainer';
import TeamContainer from 'views/static/TeamContainer';
import DevelopersContainer from 'views/static/DevelopersContainer';

export default function Routes() {
  return (
    <Switch>
      <Redirect exact from="/" to="/timetable" />
      <Route path="/about" component={AboutContainer} />
      <Route path="/faq" component={FaqContainer} />
      <Route path="/timetable" component={TimetableContainer} />
      <Route exact path="/modules" component={ModuleFinderContainer} />
      <Route path="/modules/:moduleCode" component={ModulesContainer} />
      <Route path="/settings" component={SettingsContainer} />
      <Route path="/team" component={TeamContainer} />
      <Route path="/developers" component={DevelopersContainer} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
