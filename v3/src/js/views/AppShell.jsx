// @flow
import type { Node } from 'react';
import type { TimetableConfig } from 'types/timetables';
import type { ModuleList, ModuleSelectList } from 'types/reducers';
import type { ModuleCode, Semester } from 'types/modules';
import type { Mode } from 'types/settings';

import React, { Component } from 'react';
import { NavLink, withRouter, type ContextRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import NUSModerator from 'nusmoderator';
import classnames from 'classnames';

import { fetchModuleList, fetchModule } from 'actions/moduleBank';
import { noBreak } from 'utils/react';
import ModulesSelect from 'views/components/ModulesSelect';
import Footer from 'views/layout/Footer';
import Navtabs from 'views/layout/Navtabs';
import { DARK_MODE } from 'types/settings';
import LoadingSpinner from './components/LoadingSpinner';

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
  } else {
    document.body.classList.remove('mode-dark');
  }
}

export class AppShell extends Component<Props> {
  componentWillMount() {
    setMode(this.props.mode);
    // TODO: This always re-fetch the entire modules list. Consider a better strategy for this
    this.props.fetchModuleList();

    const semesterTimetable = this.props.timetables[this.props.activeSemester];
    if (semesterTimetable) {
      // TODO: Handle failed loading of module.
      Object.keys(semesterTimetable)
        .forEach(moduleCode => this.props.fetchModule(moduleCode));
    }
  }

  componentWillUpdate(nextProps: Props) {
    setMode(nextProps.mode);
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

// withRouter here is used to ensure re-render when routes change, since
// connect implements shouldComponentUpdate based purely on props. If it
// is removed, connect not detect prop changes when route is changed and
// thus the pages are not re-rendered
export default withRouter(
  connect(mapStateToProps, {
    fetchModuleList,
    fetchModule,
  })(AppShell),
);
