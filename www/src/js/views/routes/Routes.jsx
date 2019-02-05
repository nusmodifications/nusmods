// @flow
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import TimetableContainer from 'views/timetable/TimetableContainer';
import ModulePageContainer from 'views/modules/ModulePageContainer';
import ModuleFinderContainer from 'views/modules/ModuleFinderContainer';
import VenuesContainer from 'views/venues/VenuesContainer';
import SettingsContainer from 'views/settings/SettingsContainer';
import AboutContainer from 'views/static/AboutContainer';
import ContributeContainer from 'views/contribute/ContributeContainer';
import TeamContainer from 'views/static/TeamContainer';
import ContributorsContainer from 'views/static/ContributorsContainer';
import FaqContainer from 'views/static/FaqContainer';
import AppsContainer from 'views/static/AppsContainer';
import NotFoundPage from 'views/errors/NotFoundPage';
import TodayContainer from 'views/today/TodayContainer';
import PlannerContainer from 'views/planner/PlannerContainer';
import TetrisContainer from 'views/tetris/TetrisContainer';
import ExternalRedirect from './ExternalRedirect';

// IMPORTANT: Remember to update any route changes on the sitemap
export default function Routes() {
  return (
    <Switch>
      <Redirect exact from="/" to="/timetable" />
      <Route path="/timetable/:semester?/:action?" component={TimetableContainer} />
      <Route exact path="/modules" component={ModuleFinderContainer} />
      <Route path="/modules/:moduleCode/:slug?" component={ModulePageContainer} />
      <Route path="/archive/:moduleCode/:year/:slug?" component={ModulePageContainer} />
      <Route path="/venues/:venue?" component={VenuesContainer} />
      <Route path="/today" component={TodayContainer} />
      <Route path="/planner" component={PlannerContainer} />
      <Route path="/tetris" component={TetrisContainer} />

      <Route path="/about" component={AboutContainer} />
      <Route path="/faq" component={FaqContainer} />
      <Route path="/settings" component={SettingsContainer} />
      <Route path="/contribute" component={ContributeContainer} />
      <Route path="/team" component={TeamContainer} />
      <Route path="/contributors" component={ContributorsContainer} />
      <Route path="/apps" component={AppsContainer} />

      {/* v2 routes */}
      <Redirect from="/venueavailability" to="/venues" />
      <Redirect from="/contribute/developers" to="/contributors" />
      <Redirect from="/contact" to="/faq" />
      <Redirect from="/help" to="/faq" />
      <ExternalRedirect path="/news/nusdiscount" to="https://www.facebook.com/nusdiscount/" />
      <ExternalRedirect path="/news/bareNUS" to="https://www.facebook.com/bareNUS" />
      <ExternalRedirect path="/api" to="https://api.nusmods.com" appendPath />

      {/* 404 page */}
      <Route component={NotFoundPage} />
    </Switch>
  );
}
