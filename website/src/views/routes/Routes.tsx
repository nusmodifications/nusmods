import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import TimetableContainer from 'views/timetable/TimetableContainer';
import ModulePageContainer from 'views/modules/ModulePageContainer';
import ModuleArchiveContainer from 'views/modules/ModuleArchiveContainer';
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
import MpeContainer from 'views/mpe/MpeContainer';
import ExternalRedirect from './ExternalRedirect';

// IMPORTANT: Remember to update any route changes on the sitemap
const Routes: React.FC = () => (
  <Switch>
    <Redirect exact from="/" to="/timetable" />
    <Route path="/timetable/:semester?/:action?" component={TimetableContainer} />
    <Route exact path="/courses" component={ModuleFinderContainer} />
    <Route path="/courses/:moduleCode/:slug?" component={ModulePageContainer} />
    {/* Legacy Routes: Consider removal in the future, but otherwise */}
    {/* redirecting old hyperlinks to the same page makes sense as well. */}
    <Route exact path="/modules" component={ModuleFinderContainer} />
    <Route path="/modules/:moduleCode/:slug?" component={ModulePageContainer} />
    {/* END LEGACY ROUTES */}
    <Route path="/archive/:moduleCode/:year/:slug?" component={ModuleArchiveContainer} />
    <Route path="/venues/:venue?" component={VenuesContainer} />
    <Route path="/today" component={TodayContainer} />
    <Route path="/planner" component={PlannerContainer} />
    <Route path="/cpex" component={MpeContainer} />
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
    <ExternalRedirect path="/api" to="https://cpex-staging.nusmods.com/api" appendPath />

    {/* 404 page */}
    <Route component={NotFoundPage} />
  </Switch>
);

export default Routes;
