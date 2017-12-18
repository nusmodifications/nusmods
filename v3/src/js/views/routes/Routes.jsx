// @flow
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import ScrollToTopRoute from 'views/routes/ScrollToTopRoute';

import TimetableContainer from 'views/timetable/TimetableContainer';
import ModulePageContainer from 'views/modules/ModulePageContainer';
import ModuleFinderContainer from 'views/modules/ModuleFinderContainer';
import VenuesContainer from 'views/venues/VenuesContainer';
import SettingsContainer from 'views/settings/SettingsContainer';
import AboutContainer from 'views/static/AboutContainer';
import TeamContainer from 'views/static/TeamContainer';
import DevelopersContainer from 'views/static/DevelopersContainer';
import FaqContainer from 'views/static/FaqContainer';
import AppsContainer from 'views/static/AppsContainer';
import NotFoundPage from 'views/errors/NotFoundPage';

export default function Routes() {
  return (
    <Switch>
      <Redirect exact from="/" to="/timetable" />
      <Route exact path="/modules" component={ModuleFinderContainer} />
      <Route path="/modules/:moduleCode/:slug?" component={ModulePageContainer} />
      <Route path="/venues/:venue?" component={VenuesContainer} />
      {/* Routes that need to scroll to the top upon navigation */}
      <ScrollToTopRoute path="/timetable/:semester?/:action?" component={TimetableContainer} />
      <ScrollToTopRoute path="/about" component={AboutContainer} />
      <ScrollToTopRoute path="/faq" component={FaqContainer} />
      <ScrollToTopRoute path="/settings" component={SettingsContainer} />
      <ScrollToTopRoute path="/team" component={TeamContainer} />
      <ScrollToTopRoute path="/developers" component={DevelopersContainer} />
      <ScrollToTopRoute path="/apps" component={AppsContainer} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
