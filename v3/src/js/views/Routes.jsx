// @flow
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import TimetableContainer from 'views/timetable/TimetableContainer';
import ModulePageContainer from 'views/browse/ModulePageContainer';
import ModuleFinderContainer from 'views/browse/ModuleFinderContainer';
import SettingsContainer from 'views/settings/SettingsContainer';
import AboutContainer from 'views/static/AboutContainer';
import TeamContainer from 'views/static/TeamContainer';
import DevelopersContainer from 'views/static/DevelopersContainer';
import FaqContainer from 'views/static/FaqContainer';
import NotFoundPage from 'views/errors/NotFoundPage';

export default function Routes() {
  return (
    <Switch>
      <Redirect exact from="/" to="/timetable" />
      <Route path="/about" component={AboutContainer} />
      <Route path="/faq" component={FaqContainer} />
      <Route path="/timetable" component={TimetableContainer} />
      <Route exact path="/modules" component={ModuleFinderContainer} />
      <Route path="/modules/:moduleCode/:slug?" component={ModulePageContainer} />
      <Route path="/settings" component={SettingsContainer} />
      <Route path="/team" component={TeamContainer} />
      <Route path="/developers" component={DevelopersContainer} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
