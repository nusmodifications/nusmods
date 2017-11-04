// @flow
import React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';

import type { Semester } from 'types/modules';
import type { State } from 'reducers/index';

import TimetableContainer from 'views/timetable/TimetableContainer';
import ModulePageContainer from 'views/browse/ModulePageContainer';
import ModuleFinderContainer from 'views/browse/ModuleFinderContainer';
import SettingsContainer from 'views/settings/SettingsContainer';
import AboutContainer from 'views/static/AboutContainer';
import TeamContainer from 'views/static/TeamContainer';
import DevelopersContainer from 'views/static/DevelopersContainer';
import FaqContainer from 'views/static/FaqContainer';
import NotFoundPage from 'views/errors/NotFoundPage';
import { timetablePage } from 'views/routes/paths';

type Props = {
  activeSemester: Semester,
}

function Routes(props: Props) {
  return (
    <Switch>
      <Redirect exact from="/" to={timetablePage(props.activeSemester)} />
      <Redirect exact from="/timetable" to={timetablePage(props.activeSemester)} />

      <Route path="/about" component={AboutContainer} />
      <Route path="/faq" component={FaqContainer} />
      <Route path="/timetable/:semester" component={TimetableContainer} />
      <Route exact path="/modules" component={ModuleFinderContainer} />
      <Route path="/modules/:moduleCode/:slug?" component={ModulePageContainer} />
      <Route path="/settings" component={SettingsContainer} />
      <Route path="/team" component={TeamContainer} />
      <Route path="/developers" component={DevelopersContainer} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  activeSemester: state.app.activeSemester,
});
export default withRouter(connect(mapStateToProps)(Routes));
