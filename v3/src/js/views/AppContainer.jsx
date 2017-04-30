// @flow
import type { TimetableConfig, SemTimetableConfig } from 'types/timetables';
import type { FetchRequest, ModuleList, ModuleSelectList } from 'types/reducers';

import React, { Component } from 'react';
import { routerShape, Link } from 'react-router';
import { connect } from 'react-redux';
import NUSModerator from 'nusmoderator';

import config from 'config';
import { fetchModuleList, loadModule } from 'actions/moduleBank';

import ModulesSelect from './components/ModulesSelect';
import Footer from './layout/Footer';

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
  const week = NUSModerator.academicCalendar.getAcadWeekInfo(new Date());
  let thisWeekText = `AY20${week.year}, ${week.sem}, `;
  if (week.type !== 'Instructional') { // hide 'Instructional'
    thisWeekText += week.type;
  }
  thisWeekText += ' Week';
  if (week.num > 0) { // do not show the week number if there is only one week, eg. recess
    thisWeekText += ` ${week.num}`;
  }
  return thisWeekText;
})();

export class AppContainer extends Component {
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

  props: Props;

  /* eslint-disable jsx-a11y/anchor-has-content */
  render() {
    return (
      <div className="app-container">
        <nav className="navbar navbar-fixed-top navbar-light bg-faded nm-navbar">
          <Link className="navbar-brand nm-navbar-brand" to="/" title="Home" />
          <form className="hidden-xs-down"
            style={{ width: '100%', maxWidth: 400, display: 'inline-block' }}
          >
            <ModulesSelect moduleList={this.props.moduleSelectList}
              onChange={(moduleCode) => {
                this.context.router.push(`/modules/${moduleCode.value}`);
              }}
              placeholder="Search modules"
            />
          </form>
          <p className="pull-xs-right hidden-xs-down"><small>{weekText}</small></p>
        </nav>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-2">
              <ul className="nm-nav-tabs">
                <li role="presentation" className="nm-nav-item">
                  <Link className="nav-link" activeClassName="active" to="/timetable">
                    <i className="fa fa-fw fa-lg fa-table" />
                    <span className="nm-link-title"> Timetable</span>
                  </Link>
                </li>
                <li role="presentation" className="nm-nav-item">
                  <Link className="nav-link" activeClassName="active" to="/modules">
                    <i className="fa fa-fw fa-lg fa-list" />
                    <span className="nm-link-title"> Browse</span>
                  </Link>
                </li>
                <li role="presentation" className="nm-nav-item">
                  <Link className="nav-link" activeClassName="active" to="/settings">
                    <i className="fa fa-fw fa-lg fa-gear" />
                    <span className="nm-link-title"> Settings</span>
                  </Link>
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
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

AppContainer.contextTypes = {
  router: routerShape,
};

function mapStateToProps(state) {
  return {
    moduleList: state.entities.moduleBank.moduleList,
    moduleSelectList: state.entities.moduleBank.moduleSelectList,
    timetables: state.timetables,
    fetchModuleListRequest: state.requests.fetchModuleListRequest || {},
  };
}

export default connect(
  mapStateToProps,
  {
    fetchModuleList,
    loadModule,
  },
)(AppContainer);
