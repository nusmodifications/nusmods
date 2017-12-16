// @flow
import type { Node } from 'react';
import type { TimetableConfig, SemTimetableConfig } from 'types/timetables';
import type { ModuleList, ModuleSelectList } from 'types/reducers';
import type { ModuleCode, Semester } from 'types/modules';
import type { Mode } from 'types/settings';

import React, { Component } from 'react';
import { NavLink, withRouter, type ContextRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import NUSModerator from 'nusmoderator';
import qs from 'query-string';
import classnames from 'classnames';
import { each } from 'lodash';

import config from 'config';
import { fetchModuleList, fetchModule } from 'actions/moduleBank';
import { setTimetable } from 'actions/timetables';
import { noBreak } from 'utils/react';
import { roundStart } from 'utils/cors';
import migrateTimetable from 'storage/migrateTimetable';
import ModulesSelect from 'views/components/ModulesSelect';
import Footer from 'views/layout/Footer';
import Navtabs from 'views/layout/Navtabs';
import { DARK_MODE } from 'types/settings';
import LoadingSpinner from './components/LoadingSpinner';
import CorsNotification from './components/cors-info/CorsNotification';

// Cache a current date object to stop CorsNotification from re-rendering - if this was in
// render(), a new Date object is created, forcing re-render.
const NOW = new Date();

type Props = {
  ...ContextRouter,

  children: Node,
  moduleList: ModuleList,
  moduleSelectList: ModuleSelectList,
  timetables: TimetableConfig,
  theme: string,
  mode: Mode,
  activeSemester: Semester,

  fetchModule: (ModuleCode) => void,
  fetchModuleList: () => void,
  setTimetable: (Semester, SemTimetableConfig) => Promise<*>,
};

// Put outside render because this only needs to computed on page load.
const weekText = (() => {
  const acadWeekInfo = NUSModerator.academicCalendar.getAcadWeekInfo(new Date());
  const parts = [`AY20${acadWeekInfo.year}`];

  // Check for null value (ie. during vacation)
  if (acadWeekInfo.sem) {
    parts.push(noBreak(acadWeekInfo.sem));
  }

  // Hide semester if semester type is 'Instructional'
  if (acadWeekInfo.type !== 'Instructional') {
    parts.push(noBreak(`${acadWeekInfo.type} Week`));
  }

  // Do not show the week number if there is only one week, e.g. recess
  if (acadWeekInfo.num > 0) {
    parts.push(noBreak(`Week ${acadWeekInfo.num}`));
  }

  return parts.join(', ');
})();

function setMode(mode: Mode) {
  if (!document.body) {
    return;
  }

  if (mode === DARK_MODE) {
    document.body.classList.add('mode-dark');
    return;
  }
  document.body.classList.remove('mode-dark');
}

export class AppShell extends Component<Props> {
  componentWillMount() {
    const { mode, timetables } = this.props;
    setMode(mode);

    // Retrieve module list
    // TODO: This always re-fetch the entire modules list. Consider a better strategy for this
    this.props.fetchModuleList();

    // Fetch all module data that are on timetable
    const moduleCodes = new Set();
    each(timetables, timetable =>
      Object.keys(timetable).forEach(moduleCode => moduleCodes.add(moduleCode)));
    moduleCodes.forEach(this.props.fetchModule);

    // Handle migration from v2
    // TODO: Remove this once sem 2 is over
    migrateTimetable(this.props.setTimetable);
  }

  componentWillUpdate(nextProps: Props) {
    setMode(nextProps.mode);
  }

  currentTime() {
    const debugRound = qs.parse(this.props.location.search).round;

    // For manual testing - add ?round=1A (or other round names) to trigger the notification
    if (debugRound) {
      const round = config.corsSchedule.find(r => r.round === debugRound);
      if (round) return roundStart(round);
    }

    return NOW;
  }

  render() {
    // TODO: Handle failed loading of module list
    const isModuleListReady = this.props.moduleList.length;

    return (
      <div className="app-container">
        <nav className="nm-navbar fixed-top">
          <NavLink className="nm-navbar-brand" to="/" title="Home">
            <span className="sr-only">NUSMods</span>
          </NavLink>
          <form className="nm-navbar-form">
            <ModulesSelect
              moduleList={this.props.moduleSelectList}
              onChange={(moduleCode) => {
                this.props.history.push(`/modules/${moduleCode.value}`);
              }}
              placeholder="Search modules"
            />
          </form>
          <span className="nm-navbar-text"><small>{weekText}</small></span>
        </nav>

        <div className="main-container">
          <Navtabs />

          <CorsNotification time={this.currentTime()} />

          <main className={classnames('main-content', `theme-${this.props.theme}`)}>
            {isModuleListReady ? this.props.children : <LoadingSpinner />}
          </main>
        </div>

        <Footer />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  moduleList: state.entities.moduleBank.moduleList,
  moduleSelectList: state.entities.moduleBank.moduleSelectList,
  timetables: state.timetables,
  theme: state.theme.id,
  mode: state.settings.mode,
  activeSemester: state.app.activeSemester,
});

export default withRouter(
  connect(mapStateToProps, {
    fetchModuleList,
    fetchModule,
    setTimetable,
  })(AppShell),
);
