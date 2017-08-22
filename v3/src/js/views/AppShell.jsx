// @flow
import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import NUSModerator from 'nusmoderator';

import type { TimetableConfig, SemTimetableConfig } from 'types/timetables';
import type { FetchRequest, ModuleList, ModuleSelectList } from 'types/reducers';

import config from 'config';
import { fetchModuleList, loadModule } from 'actions/moduleBank';

import Routes from 'views/Routes';
import ModulesSelect from 'views/components/ModulesSelect';
import Footer from 'views/layout/Footer';

type Props = {
  children: React.Children,
  loadModule: Function,
  fetchModuleList: Function,
  moduleList: ModuleList,
  moduleSelectList: ModuleSelectList,
  timetables: TimetableConfig,
  fetchModuleListRequest: FetchRequest,
};

// Put outside render because this only needs to computed on page load.
const weekText = (() => {
  const acadWeekInfo = NUSModerator.academicCalendar.getAcadWeekInfo(new Date());
  const year = `AY20${acadWeekInfo.year}`;
  let semester = '';
  let semesterType = '';
  let week = '';

  // Check for null value (ie. during vacation)
  if (acadWeekInfo.sem) {
    semester = `, ${acadWeekInfo.sem}`;
  }

  // Hide semester if semester type is 'Instructional'
  if (acadWeekInfo.type !== 'Instructional') {
    semesterType = `, ${acadWeekInfo.type} Week`;
  }

  // Do not show the week number if there is only one week, eg. recess
  if (acadWeekInfo.num > 0) {
    week = `, Week ${acadWeekInfo.num}`;
  }

  const acadWeekString = `${year}${semester}${semesterType}${week}`;
  return acadWeekString;
})();

export class AppShell extends Component {
  props: Props;

  componentDidMount() {
    this.props.fetchModuleList();
    const semesterTimetable: SemTimetableConfig = this.props.timetables[config.semester];
    if (semesterTimetable) {
      Object.keys(semesterTimetable).forEach((moduleCode) => {
        // TODO: Handle failed loading of module.
        this.props.loadModule(moduleCode);
      });
    }
  }

  /* eslint-disable jsx-a11y/anchor-has-content */
  render() {
    return (
      <div className="app-container">
        <nav className="nm-navbar fixed-top">
          <NavLink className="nm-navbar-brand" to="/" title="Home" />
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
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-2">
              <ul className="nm-nav-tabs">
                <li role="presentation" className="nm-nav-item">
                  <NavLink className="nav-link" activeClassName="active" to="/timetable">
                    <i className="fa fa-fw fa-lg fa-table" />
                    <span className="nm-link-title"> Timetable</span>
                  </NavLink>
                </li>
                <li role="presentation" className="nm-nav-item">
                  <NavLink className="nav-link" activeClassName="active" to="/modules">
                    <i className="fa fa-fw fa-lg fa-list" />
                    <span className="nm-link-title"> Browse</span>
                  </NavLink>
                </li>
                <li role="presentation" className="nm-nav-item">
                  <NavLink className="nav-link" activeClassName="active" to="/settings">
                    <i className="fa fa-fw fa-lg fa-gear" />
                    <span className="nm-link-title"> Settings</span>
                  </NavLink>
                </li>
              </ul>
            </div>
            <div className="col-md-10 main-content">
              {this.props.fetchModuleListRequest.isPending && !this.props.moduleList.length ?
                <p>Loading...</p> : null
              }
              {this.props.fetchModuleListRequest.isSuccessful || this.props.moduleList.length ?
                this.props.children : null
              }
              <Routes />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    moduleList: state.entities.moduleBank.moduleList,
    moduleSelectList: state.entities.moduleBank.moduleSelectList,
    timetables: state.timetables,
    fetchModuleListRequest: state.requests.fetchModuleListRequest || {},
  };
}

export default withRouter(
  connect(mapStateToProps, {
    fetchModuleList,
    loadModule,
  })(AppShell),
);
