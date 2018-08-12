// @flow
import React, { type Node } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import TimetableContainer from 'views/timetable/TimetableContainer';
import ModulePageContainer from 'views/modules/ModulePageContainer';
import ModuleFinderContainer from 'views/modules/ModuleFinderContainer';
import VenuesContainer from 'views/venues/VenuesContainer';
import SettingsContainer from 'views/settings/SettingsContainer';
import AboutContainer from 'views/static/AboutContainer';
import TeamContainer from 'views/static/TeamContainer';
import ContributorsContainer from 'views/static/ContributorsContainer';
import FaqContainer from 'views/static/FaqContainer';
import AppsContainer from 'views/static/AppsContainer';
import NotFoundPage from 'views/errors/NotFoundPage';

// IMPORTANT: Remember to update any route changes on the sitemap
export default function Routes() {
  return (
    <Switch>
      <Redirect exact from="/" to="/timetable" />
      <Route path="/timetable/:semester?/:action?" component={TimetableContainer} />
      <Route exact path="/modules" component={ModuleFinderContainer} />
      <Route path="/modules/:moduleCode/:slug?" component={ModulePageContainer} />
      <Route path="/venues/:venue?" component={VenuesContainer} />
      <Route path="/about" component={AboutContainer} />
      <Route path="/faq" component={FaqContainer} />
      <Route path="/contact" component={FaqContainer} />
      <Route path="/settings" component={SettingsContainer} />
      <Route path="/team" component={TeamContainer} />
      <Route path="/contributors" component={ContributorsContainer} />
      <Route path="/apps" component={AppsContainer} />

      {/* v2 routes */}
      <Redirect from="/venueavailability" to="/venues" />
      <Redirect from="/contribute/developers" to="/contributors" />
      <Route
        path="/news/nusdiscount"
        render={(): Node => {
          window.location = 'https://www.facebook.com/nusdiscount/';
          return null;
        }}
      />
      <Route
        path="/news/bareNUS"
        render={(): Node => {
          window.location = 'https://www.facebook.com/bareNUS';
          return null;
        }}
      />

      {/* 404 page */}
      <Route component={NotFoundPage} />
    </Switch>
  );
}
