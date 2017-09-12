// @flow
import type { Node } from 'react';

import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import NUSModerator from 'nusmoderator';

import type { TimetableConfig } from 'types/timetables';
import type { ModuleList, ModuleSelectList } from 'types/reducers';
import type { ModuleCode } from 'types/modules';

import config from 'config';
import { fetchModuleList, loadModule } from 'actions/moduleBank';
import { noBreak } from 'utils/react';
import ModulesSelect from 'views/components/ModulesSelect';
import Footer from 'views/layout/Footer';
import LoadingSpinner from './LoadingSpinner';

type Props = {
  children: Node,
  loadModule: (ModuleCode) => void,
  fetchModuleList: () => void,
  moduleList: ModuleList,
  moduleSelectList: ModuleSelectList,
  timetables: TimetableConfig,
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

  // Do not show the week number if there is only one week, eg. recess
  if (acadWeekInfo.num > 0) {
    parts.push(noBreak(`Week ${acadWeekInfo.num}`));
  }

  return parts.join(', ');
})();

export class AppShell extends Component<Props> {
  props: Props;

  componentWillMount() {
    // TODO: This always refetch the entire modules list. Consider a better strategy for this
    this.props.fetchModuleList();

    const semesterTimetable = this.props.timetables[config.semester];

    if (semesterTimetable) {
      Object.keys(semesterTimetable).forEach((moduleCode) => {
        // TODO: Handle failed loading of module.
        this.props.loadModule(moduleCode);
      });
    }
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
                this.context.router.push(`/modules/${moduleCode.value}`);
              }}
              placeholder="Search modules"
            />
          </form>
          <span className="nm-navbar-text"><small>{weekText}</small></span>
        </nav>

        <div className="main-container">
          <nav className="nm-nav-tabs">
            <NavLink className="nav-link" activeClassName="active" to="/timetable">
              <i className="fa fa-fw fa-lg fa-table" />
              <span className="nm-link-title">Timetable</span>
            </NavLink>
            <NavLink className="nav-link" activeClassName="active" to="/modules">
              <i className="fa fa-fw fa-lg fa-list" />
              <span className="nm-link-title">Browse</span>
            </NavLink>
            <NavLink className="nav-link" activeClassName="active" to="/settings">
              <i className="fa fa-fw fa-lg fa-gear" />
              <span className="nm-link-title">Settings</span>
            </NavLink>
          </nav>

          <main className="main-content">
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
});

export default withRouter(
  connect(mapStateToProps, {
    fetchModuleList,
    loadModule,
  })(AppShell),
);
